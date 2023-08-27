FROM node:16-bullseye-slim
ARG MONGO_URL

RUN apt-get update && \
    apt-get install -y build-essential libvips-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app
WORKDIR /app
COPY . .
RUN npm install

RUN export MONGO_URL=$MONGO_URL; npm run build
EXPOSE 3000
CMD ["npm", "start"]