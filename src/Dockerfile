FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./tsconfig.json
COPY src ./src

RUN npm run build
RUN npm prune --omit=dev

EXPOSE 5000

CMD ["npm", "start"]
