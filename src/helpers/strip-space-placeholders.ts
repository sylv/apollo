/**
 * Given a file or directory name, replace dots that are used as placeholders for spaces.
 */
export function stripSpacePlaceholders(filePathPart: string): string {
  const spaces = filePathPart.split(" ").length;
  const dots = filePathPart.split(".").length;
  const underscores = filePathPart.split("_").length;
  if ((underscores <= 2 || dots <= 2) && spaces >= 4) return filePathPart;
  const uses = dots > underscores ? "." : "_";
  return filePathPart.split(uses).join(" ");
}
