FROM node:16-bullseye-slim
ARG MONGO_URL

RUN apt-get update && \
    apt-get install -y build-essential libvips-dev cron && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app
WORKDIR /app
COPY . .
RUN npm install
RUN (crontab -l ; echo "* * * * * curl http://localhost:3000/schedule/oneminute") | sort - | uniq - | crontab -
RUN (crontab -l ; echo "*/5 * * * * curl http://localhost:3000/schedule/fiveminute") | sort - | uniq - | crontab -

RUN export MONGO_URL=$MONGO_URL; npm run build
EXPOSE 3000
CMD ["/bin/sh", "-c", "/etc/init.d/cron start;npm start"]