# youtube-live-recorder

Records YouTube live streams with `yt-dlp` and notifies Discord when a recording has finished. It runs with Docker Compose.

## Services

`docker-compose.yml` defines three services. `recorder` and `watch-new-movie` share the `./data` bind mount (`/data` in the containers).

- `recorder`: records the target channel or playlist. Settings come from `recorder.env`.
- `watch-new-movie`: checks `/data/` once per hour for new `.mp4` files and sends a notification through `discord-deliver`. Notified files are tracked in `/data/notified.json`. While that file is missing or an empty list, nothing is notified: the first scan that finds `.mp4` files records them as already notified, so the first recording on a fresh install is not notified.
- `discord-deliver`: the external image `book000/discord-deliver`. Its settings come from `discord-deliver.env`; see that image for the available variables.

## Usage

1. Create `recorder.env` and `discord-deliver.env` next to `docker-compose.yml`.
2. Run `docker compose up -d`.

Recordings are saved as `data/<TARGET>/<name>.mp4`, where `<name>` follows `OUTPUT_FILENAME_PATTERN` (default: the video title). While a recording is in progress, its files are kept in `data/<TARGET>/part/`.

## Configuration (`recorder.env`)

Either `CHANNEL` or `PLAYLIST` is required. If both are set, `PLAYLIST` is used.

- `TARGET` (required): A unique ID for the target. It is used as the name of the save directory.
- `CHANNEL` (optional): The ID of the channel to record. The channel's `/live` page is watched.
- `PLAYLIST` (optional): The ID of the playlist to record.
- `TITLE_FILTER` (optional): Passed to `yt-dlp --match-title`: only videos whose title matches this regular expression (case-insensitive search) are downloaded. The value is passed to `yt-dlp` as a single argument, so it may contain whitespace and glob characters.
- `OUTPUT_FILENAME_PATTERN` (optional): The `yt-dlp` output template for the file name, for example `%(title)s-%(id)s.%(ext)s` to avoid overwriting recordings with the same title. Defaults to `%(title)s.%(ext)s`.

On the first start (when `data/recorded/<TARGET>` does not exist), the video IDs that yt-dlp lists for the target URL are added to that download archive and are not downloaded. For `PLAYLIST` this is every video currently in the playlist; for `CHANNEL` the watched URL is the channel's `/live` page, so normally only the stream that is live at that moment is archived (if the channel is not live, nothing is archived).

## Warning / Disclaimer

The developer is not responsible for any problems caused by the user using this project.

## License

The license for this project is [MIT License](LICENSE).
