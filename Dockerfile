FROM node:lts-alpine as build-stage

WORKDIR /app

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

COPY package*.json ./
RUN npm install -f
COPY . .

EXPOSE 3333

CMD cd /app/ && \
     npm start