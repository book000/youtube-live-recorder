#!/bin/bash

set +x

# check if TARGET variable is set
if [[ -z "$TARGET" ]]; then
  echo "TARGET variable is not set"
  exit 1
fi

# define URL variable
if [[ -n "$CHANNEL" ]]; then
  URL="https://www.youtube.com/channel/$CHANNEL/live"
fi
if [[ -n "$PLAYLIST" ]]; then
  URL="https://www.youtube.com/playlist?list=$PLAYLIST"
fi

if [[ -z "$URL" ]]; then
  echo "Please provide a URL to a channel or playlist"
  exit 1
fi

# check define title filter variable
if [[ -n "$TITLE_FILTER" ]]; then
  TITLE_FILTER_ARG="--match-title $TITLE_FILTER"
fi

RECORDED_FILE="/data/recorded/$TARGET"
if [[ ! -d $(dirname "$RECORDED_FILE") ]]; then
  mkdir -p "$(dirname "$RECORDED_FILE")"
fi

OUTPUT_DIR="/data/$TARGET/%(title)s.%(ext)s"
if [[ ! -d $(dirname "$OUTPUT_DIR") ]]; then
  mkdir -p "$(dirname "$OUTPUT_DIR")"
fi

if [[ ! -f $RECORDED_FILE ]]; then
  echo "No recorded file found, add all videos to the recorded file"
  yt-dlp -q --flat-playlist --print-to-file id ids.txt "$URL"
  xargs -I {} echo youtube {} < ids.txt >> "$RECORDED_FILE"
fi

ytdlpVersion=$(curl --silent "https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')

echo "yt-dlp version: $ytdlpVersion"

i=0
while :; do
  i=$((i+1))
  # yt-dlp updater
  if [[ $((i%120)) -eq 0 ]]; then
    # 120*5 = 600 seconds = 10 minutes
    nowVersion=$(curl --silent "https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
    if [[ "$nowVersion" != "$ytdlpVersion" ]]; then
      yt-dlp -U
      echo "yt-dlp version updated: $ytdlpVersion -> $nowVersion"
      ytdlpVersion=$nowVersion
    fi
  fi

  # shellcheck disable=2086
  yt-dlp -i --live-from-start --hls-use-mpegts --hls-prefer-native $TITLE_FILTER_ARG --download-archive "$RECORDED_FILE" -f bestvideo+bestaudio --add-metadata --merge-output-format mp4 -o "$OUTPUT_DIR" "$URL"
  sleep 5
done