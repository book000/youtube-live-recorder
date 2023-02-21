FROM python:3-slim

# hadolint ignore=DL3008
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install --no-install-recommends -y curl ffmpeg jq && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# yt-dlpはentrypoint.shでダウンロードする

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT [ "/app/entrypoint.sh" ]