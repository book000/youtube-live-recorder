FROM node:lts

# node:lts no longer ships yarn (and Debian has no yarn package)
# hadolint ignore=DL3016
RUN npm install -g yarn@1.22.22

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn
COPY src/ src/
COPY tsconfig.json .
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]