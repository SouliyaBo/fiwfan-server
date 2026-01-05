FROM node:20-alpine

WORKDIR /usr/src/app

# Install redis-cli using apk
RUN apk update && apk add redis

COPY package.json ./

RUN npm install

COPY . .

CMD [ "npm", "run", "start" ]