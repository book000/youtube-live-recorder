#!/bin/bash

set +x

# check if TARGET variable is set
if [[ -z "${TARGET}" ]]; then
  echo "TARGET variable is not set"
  exit 1
fi

# define URL variable
if [[ -n "${CHANNEL}" ]]; then
  URL="https://www.youtube.com/channel/${CHANNEL}/live"
fi
if [[ -n "${PLAYLIST}" ]]; then
  URL="https://www.youtube.com/playlist?list=${PLAYLIST}"
fi

if [[ -z "${URL}" ]]; then
  echo "Please provide a URL to a channel or playlist"
  exit 1
fi

# check define title filter variable
if [[ -n "${TITLE_FILTER}" ]]; then
  TITLE_FILTER_ARG="--match-title ${TITLE_FILTER}"
fi

RECORDED_FILE="/data/recorded/${TARGET}"
if [[ ! -d $(dirname "${RECORDED_FILE}") ]]; then
  mkdir -p "$(dirname "${RECORDED_FILE}")"
fi

# Put the part file generated during download in the part directory
# Move only mp4 file after download completes
OUTPUT_DIR="/data/${TARGET}/part/%(title)s.%(ext)s"
if [[ ! -d $(dirname "${OUTPUT_DIR}") ]]; then
  mkdir -p "$(dirname "${OUTPUT_DIR}")"
fi
MOVE_DIR="/data/${TARGET}/"

if [[ ! -f ${RECORDED_FILE} ]]; then
  echo "No recorded file found, add all videos to the recorded file"
  yt-dlp -q --flat-playlist --print-to-file id ids.txt "${URL}"
  xargs -I {} echo youtube {} < ids.txt >> "${RECORDED_FILE}"
fi

# shellcheck disable=SC2312
yt-dlp --version
yt-dlp -U
yt-dlp --version

# Check if it's streaming every 5 seconds
# Check for yt-dlp updates every 10 minutes

i=0
while :; do
  i=$((i+1))
  # yt-dlp updater
  if [[ $((i%120)) -eq 0 ]]; then
    # 120*5 = 600 seconds = 10 minutes
    yt-dlp -U
  fi

  # shellcheck disable=SC2086
  yt-dlp -i --live-from-start --hls-use-mpegts --hls-prefer-native ${TITLE_FILTER_ARG} --download-archive "${RECORDED_FILE}" -f bestvideo+bestaudio --add-metadata --merge-output-format mp4 -o "${OUTPUT_DIR}" "${URL}"

  # Move the file to the parent directory (but f140, f248, f299 files are not move)
  # shellcheck disable=SC2046
  find $(dirname "${OUTPUT_DIR}") -name "*.mp4" -not -name "*.f*.mp4" -exec mv {} "${MOVE_DIR}" \;
  sleep 5
done