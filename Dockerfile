FROM node:lts-alpine as build-stage

WORKDIR /app
COPY package*.json ./
RUN npm install -f
COPY . .

EXPOSE 3333

CMD cd /app/ && \
     npm start