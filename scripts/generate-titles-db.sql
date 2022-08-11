PRAGMA foreign_keys  = OFF;

-- create slim_titles table
DROP TABLE IF EXISTS slim_titles;
CREATE TABLE IF NOT EXISTS slim_titles (
    titleId INTEGER PRIMARY KEY,
    type INTEGER NOT NULL,
    name TEXT NOT NULL,
    startYear INTEGER,
    endYear INTEGER,
    runtimeMinutes INTEGER,
    genres TEXT,
    seasonCount INTEGER,
    episodeCount INTEGER,
    averageRating INTEGER,
    numVotes INTEGER
);

-- insert slim_titles data
INSERT INTO slim_titles (titleId, type, name, startYear, endYear, runtimeMinutes, genres, seasonCount, episodeCount, averageRating, numVotes)
SELECT titles.titleId, type, name, startYear, endYear, runtimeMinutes, genres, seasonCount, episodeCount, averageRating, numVotes 
FROM titles
LEFT JOIN ratings ON titles.titleId = ratings.titleId
LEFT JOIN (
    SELECT parentId, 
            MAX(seasonNumber) AS seasonCount, 
            COUNT(*) as episodeCount 
    FROM episodes 
    GROUP BY parentId
) AS episodes ON episodes.parentId = titles.titleId
WHERE numVotes > 100
AND (
    type = 0 OR
    type = 1
);





-- create slim_episodes table
DROP TABLE IF EXISTS slim_episodes;
CREATE TABLE IF NOT EXISTS slim_episodes (
    episodeId INTEGER PRIMARY KEY,
    parentId INTEGER NOT NULL REFERENCES slim_titles(titleId),
    seasonNumber INTEGER NOT NULL,
    episodeNumber INTEGER NOT NULL,
    episodeName TEXT,
    averageRating INTEGER,
    numVotes INTEGER
);

-- insert slim_episodes data
INSERT INTO slim_episodes (episodeId, parentId, seasonNumber, episodeNumber, episodeName, averageRating, numVotes)
SELECT episodeId, parentId, seasonNumber, episodeNumber, title.name AS episodeName, ratings.averageRating AS averageRating, ratings.numVotes AS numVotes
FROM episodes
LEFT JOIN ratings ON episodes.episodeId = ratings.titleId
INNER JOIN titles AS title ON episodes.episodeId = title.titleId 
INNER JOIN slim_titles AS parent ON episodes.parentId = parent.titleId
WHERE parent.numVotes > 500 AND parent.episodeCount < 2000;





-- create slim_seasons table
DROP TABLE IF EXISTS slim_seasons;
CREATE TABLE IF NOT EXISTS slim_seasons (
    parentId INTEGER NOT NULL REFERENCES slim_titles(titleId),
    seasonNumber INTEGER NOT NULL,
    episodeCount INTEGER NOT NULL,
    PRIMARY KEY (parentId, seasonNumber)
);

INSERT INTO slim_seasons (parentId, seasonNumber, episodeCount)
SELECT parentId, seasonNumber, COUNT(*) AS episodeCount FROM episodes GROUP BY parentId, seasonNumber;





-- cleanup
DROP TABLE episodes;
DROP TABLE ratings;
DROP TABLE titles;
ALTER TABLE slim_episodes RENAME TO episodes;
ALTER TABLE slim_titles RENAME TO titles;
ALTER TABLE slim_seasons RENAME TO seasons;
PRAGMA foreign_keys  = ON;
PRAGMA wal_checkpoint(TRUNCATE)
VACUUM;
