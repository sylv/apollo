# titles.db

This database generated from IMDb and are intended to be used for resolving local names to IMDb IDs.

## limitations

- Only movies, series and episodes are included.
- Only movies or series with over 100 votes are included.
- Only episodes where the series has over 500 votes and under 2000 total episodes are included
- Episodes with generic names like `Episode #34.1` are excluded.
- `episodeCount` is extrapolated before episodes are excluded, so it will be accurate even if the episodes it is based on are not in the dataset.
