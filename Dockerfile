FROM node:16-bullseye-slim

RUN apt-get update && \
    apt-get install -y build-essential libvips-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app
WORKDIR /app
COPY . .
RUN npm install

RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]