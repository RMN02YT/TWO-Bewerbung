FROM node:18

LABEL org.opencontainers.image.authors="minemo"
LABEL org.opencontainers.image.description="Containerized Node.js application for the TWO Bot"

WORKDIR /app

COPY . .

RUN npm ci --only=production --omit=dev

COPY . /app

CMD ["npm", "start"]