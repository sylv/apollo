import path from 'path';
import fs from 'fs';
import rrdir from 'rrdir';
import { ignoreFilesIncluding, mediaFileExtensions, stripFileNameRegex, supportingFileExtensions } from './constants';
import { stripNameTags } from './helpers/stripNameTags';
import { Logger } from './logger';
import { NameParser } from './parser';
import { FileType } from './parser/types';
import { ApolloOptions, File, GroupedFile, ParsedFile } from './types';

export class Apollo {
  private log = this.options.logger;
  private directories: string[] = [];

  constructor(readonly options: ApolloOptions & { input: string; output: string; logger: Logger }) {}

  /**
   * Run apollo using the options provided
   */
  async run() {
    const inputDisk = this.options.input.split(path.sep).filter(f => f)[0];
    const outputDisk = this.options.output.split(path.sep).filter(f => f)[0];
    if (inputDisk !== outputDisk) {
      // todo: handle this better - copying seems annoying and unreliable though.
      return this.log.throw('Input and output must be on the same disk.');
    }

    const files = await this.getFileIndex();
    const groupedFiles = this.groupFiles(files.parsedMediaFiles, files.parsedSupportingFiles);
    let checkedCount = 0;
    let newCount = 0;

    for (let group of groupedFiles) {
      const location = this.getFileLocation(group);
      const existingDir = this.directories.find(name => name.toLowerCase() === location.dir.toLowerCase());
      const locationDir = existingDir || location.dir;
      if (!existingDir) {
        await fs.promises.mkdir(locationDir, { recursive: true });
        this.directories.push(locationDir);
      } else {
        this.log.debug(`Skipping creation of directory "${locationDir}" as another one with the same case-insensitive name.`);
      }

      for (let file of group.files) {
        const ext = path.extname(file.path);
        const fileName = location.name + ext;
        const newFilePath = path.join(locationDir, fileName);

        this.log.debug(`Linking "${file.path}" -> "${newFilePath}"`);

        try {
          checkedCount += 1;
          await fs.promises.symlink(file.path, newFilePath);
          newCount += 1;
        } catch (e) {
          if (e.code === 'EPERM') {
            this.log.throw(
              `Permission error linking "${file.path}" -> "${newFilePath}". If you are on windows, make sure you are running Apollo as administrator.`
            );
          } else if (e.code === 'EEXIST') {
            this.log.debug(`File "${newFilePath}" already exists. Skipping symlink`);
            continue;
          }

          throw e;
        }
      }
    }

    this.log.info(`Checked ${checkedCount.toLocaleString()} files and moved  ${newCount.toLocaleString()} new files`);
  }

  /**
   * Get where a file should be saved to.
   */
  private getFileLocation(file: GroupedFile) {
    switch (file.parsed.type) {
      case FileType.EPISODE:
        const seasonName = file.parsed.seasonNumber ? `Season ${file.parsed.seasonNumber}` : 'Unknown Season';
        const episodeName = file.parsed.episodeName ? ` - ${file.parsed.episodeName}` : '';
        const seasonNumber = file.parsed.seasonNumber
          ? ` - s${file.parsed.seasonNumber.toString().padStart(2, '0')}e${file.parsed.episodeNumber?.toString().padStart(2, '0')}`
          : '';

        return {
          // "TV Shows/My Show/Season 1"
          dir: path.join(this.options.output, 'TV Shows', file.parsed.title as string, seasonName),
          // "My Show - 1x3" or "My Show - 1x3 - My Episode"
          name: `${file.parsed.title}${seasonNumber}${episodeName}`
        };
      case FileType.MOVIE:
        const name = `${file.parsed.title}` + (file.parsed.year ? ` (${file.parsed.year})` : '');

        return {
          // "Movies/My Movie" or "Movies/My Movie (2009)"
          dir: path.join(this.options.output, 'Movies', name),
          name
        };
    }
  }

  /**
   * Group "media" (video) files and "supporting" (subtitles, etc) files together.
   * @param mediaFiles
   * @param allSupportingFiles
   */
  private groupFiles(mediaFiles: ParsedFile[], allSupportingFiles: File[]) {
    const grouped: GroupedFile[] = [];
    for (const file of mediaFiles) {
      const supporting: File[] = [];

      switch (file.parsed.type) {
        case FileType.MOVIE:
          // for movies we're a little more lenient because there are much higher chances the only
          // supporting files in the directory are for the movie
          // basically we look for any supporting file starting with the movie title in the same directory
          const strippedTitle = this.stripStringForComparison(file.parsed.title as string);
          const startsWith = file.main.strippedParentDirectory.startsWith(strippedTitle);

          const check = (sFile: File): Boolean => {
            if (sFile.strippedName === file.main.strippedName) {
              return true;
            }

            // if the movie is in a directory for itself, we check subdirectories (e.g, "subttiles" is checked)
            // if the movie is not in a directory for itself (e.g, just sitting by itself in the input dir)
            // require the supporting file to be in the exact same dir as the main file
            const checkDir = startsWith ? sFile.directoryPath.startsWith(file.main.directoryPath) : sFile.directory === file.main.directory;
            if (checkDir && sFile.strippedName.startsWith(strippedTitle)) {
              return true;
            }

            return false;
          };

          const similarFiles = allSupportingFiles.filter(check);
          supporting.push(...similarFiles);

          break;
        default:
          const similar = allSupportingFiles.filter(s => s.strippedName === file.main.strippedName);
          supporting.push(...similar);
      }

      grouped.push({
        ...file,
        files: supporting.concat(file.main)
      });
    }

    return grouped;
  }

  /**
   * Get a list of all valid media and supporting files in this.options.input.
   */
  private async getFileIndex() {
    const parsedMediaFiles: ParsedFile[] = [];
    const parsedSupportingFiles: File[] = [];
    let ignoredCount = 0;

    for await (const file of rrdir.stream(this.options.input, { strict: true, followSymlinks: true, stats: true })) {
      const lowerPath = file.path.toLowerCase();
      const ignoreFile = ignoreFilesIncluding.some(part => lowerPath.includes(part));
      const isMediaFile = mediaFileExtensions.some(ext => file.path.endsWith(`.${ext}`));
      const isSupportingFile = supportingFileExtensions.some(ext => file.path.endsWith(`.${ext}`));
      const supportedType = isMediaFile || isSupportingFile;

      if (file.err || !file.stats || ignoreFile || !supportedType) {
        if (ignoreFile) {
          ignoredCount += 1;
          this.log.debug(`Ignoring "${file.path}" because it contains undesirable keywords`);
        } else if (!supportedType) {
          ignoredCount += 1;
          this.log.debug(`Ignoring "${file.path}" because it is not a supported file type`);
        } else if (file.err || !file.stats) {
          this.log.warn(`Ignoring "${file.path}" due to an error when reading the file`);
        }

        continue;
      }

      if (isMediaFile && file.stats.size < this.options.minSize) {
        ignoredCount += 1;
        this.log.debug(`Ignoring "${file.path}" as it is a media file smaller than ${this.options.minSize.toLocaleString()} bytes`);
        continue;
      }

      if (isSupportingFile) {
        const parsedSupportingFile = this.parseFilePath(file);
        parsedSupportingFiles.push(parsedSupportingFile);
      } else {
        const parsedMediaFile = this.parseMediaFile(file);
        if (!parsedMediaFile.parsed.title) {
          this.log.error(`Ignoring "${file.path}" because we failed to extract a title`);
          continue;
        }

        parsedMediaFiles.push(parsedMediaFile);
      }
    }

    if (ignoredCount !== 0 && !this.options.debug) {
      this.log.warn(`Ignored ${ignoredCount.toLocaleString()} undesirable files. Run with --debug for a full list.`);
    }

    return {
      parsedMediaFiles,
      parsedSupportingFiles
    };
  }

  /**
   * Parse a file path into structured data  using the name parser.
   * @param filePath The complete to the file, "D:\\My.Show.S05.COMPLETE.720p.WEB.x264-STRiFE[TGx]\\my.show.s05e12.my.episode.name720p.web.x264-strife.mkv"
   */
  private parseMediaFile(file: rrdir.Entry): ParsedFile {
    const main = this.parseFilePath(file);
    const parser = new NameParser();
    const parsed = parser.parse(main.fileName);

    return {
      main,
      parsed
    };
  }

  /**
   * Split up a file path into usable components
   * @param filePath The path to the file, "D:\\My.Show.S05.COMPLETE.720p.WEB.x264-STRiFE[TGx]\\my.show.s05e12.my.episode.name720p.web.x264-strife.mkv"
   */
  private parseFilePath(file: rrdir.Entry): File {
    const fileName = path.basename(file.path);
    const fileDirectory = path.dirname(file.path);
    const strippedFileName = this.stripStringForComparison(fileName);
    const parentDirectory = path.basename(fileDirectory);
    const strippedParentDirectory = this.stripStringForComparison(parentDirectory);

    return {
      ...file,
      fileName,
      directoryPath: fileDirectory,
      strippedName: strippedFileName,
      strippedParentDirectory
    };
  }

  /**
   * Strip undesirable parts of a string to make it better for direct comparison
   * @param input  The input, e.g "I.Am.Mother.2019.1080p.WEBRip.x264-[YTS.LT].mp4"
   * @returns "i am mother 2019 1080p webrip x264"
   */
  private stripStringForComparison(input: string) {
    return (
      stripNameTags(input.toLowerCase())
        // replace dots and underscores with spaces. we won't lose anything
        .replace(/\.|_/g, ' ')
        // replace things that might get in the way of direct comparisons
        .replace(stripFileNameRegex, ' ')
        // remove resolution, because sometimes "My.Movie.BluRay.720p.x264.srt" is intended for "My.Movie.2009.BluRay.1080p.x264"
        .replace(/[0-9]{3,4}p/i, ' ')
        // remove double spaces that we may have created
        .replace(/[ ]{2,}/g, ' ')
        .trim()
    );
  }
}
