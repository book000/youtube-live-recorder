# youtube-live-recorder

Record and download YouTube live videos.  
Works with Docker (Docker Compose).

## Configuration

When using Docker Compose, settings file is `recorder.env`.

Either `CHANNEL` or `PLAYLIST` is required.

- `TARGET` (required): Specify the target unique ID. This ID is used as the directory name of the save destination.
- `CHANNEL` (optional): Specify the ID of the channel to be recorded.
- `PLAYLIST` (optional): Specify the ID of the playlist to be recorded.
- `TITLE_FILTER` (optional): When filtering with the title name, specify the textbook to filter.
