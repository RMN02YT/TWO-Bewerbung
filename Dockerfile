LABEL org.opencontainers.image.source=https://github.com/minemo/TWO-Bewerbung/
LABEL org.opencontainers.image.description="Containerized Node.js application for the TWO Bot"

FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]