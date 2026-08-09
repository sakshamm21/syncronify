FROM node:20-alpine

WORKDIR /app

COPY ./server/package.json /app/package.json
COPY ./server/package-lock.json /app/package-lock.json

RUN npm install

COPY ./server .

EXPOSE 4000

CMD ["node", "serverMain.js"]
