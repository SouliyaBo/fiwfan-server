FROM node:20-alpine

WORKDIR /usr/src/app

# Install redis-cli using apk
RUN apk update

COPY package.json ./

RUN npm install

COPY . .

ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm run build

CMD [ "npm", "run", "start" ]