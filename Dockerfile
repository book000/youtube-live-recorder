FROM python:3-slim

# hadolint ignore=DL3008
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install --no-install-recommends -y curl ffmpeg jq && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# renovate: datasource=github-tags depName=yt-dlp/yt-dlp versioning=loose
ENV YT_DLP_VERSION=2026.01.29
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/download/${YT_DLP_VERSION}/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT [ "/app/entrypoint.sh" ]