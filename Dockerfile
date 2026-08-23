FROM node:20-alpine

WORKDIR /app

COPY ./server/package.json /app/package.json
COPY ./server/package-lock.json /app/package-lock.json

RUN npm install

COPY ./server /app

EXPOSE 8000

CMD ["node", "serverMain.js"]
