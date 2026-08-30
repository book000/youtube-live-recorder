FROM python:3-slim

# hadolint ignore=DL3008
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install --no-install-recommends -y curl ffmpeg jq unzip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# renovate: datasource=github-tags depName=yt-dlp/yt-dlp versioning=loose
ENV YT_DLP_VERSION=2026.08.19
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/download/${YT_DLP_VERSION}/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

# renovate: datasource=github-releases depName=denoland/deno versioning=loose
ENV DENO_VERSION=v2.9.6
ARG TARGETARCH
RUN case "${TARGETARCH}" in \
      amd64) DENO_ARCH=x86_64-unknown-linux-gnu ;; \
      arm64) DENO_ARCH=aarch64-unknown-linux-gnu ;; \
      *) echo "Unsupported TARGETARCH: ${TARGETARCH}" >&2; exit 1 ;; \
    esac && \
    curl -L "https://github.com/denoland/deno/releases/download/${DENO_VERSION}/deno-${DENO_ARCH}.zip" -o /tmp/deno.zip && \
    unzip /tmp/deno.zip -d /usr/local/bin && \
    chmod a+rx /usr/local/bin/deno && \
    rm /tmp/deno.zip

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT [ "/app/entrypoint.sh" ]