 

## Development

First, setup your environment variables by editing the `.env`-file an add required environment variables. See list below.

Then run the development server

  
```bash
npm  run  dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Creating first admin user

To create your frist admin-user, use the attached CLI for managing users.

#### Setup .env
In the cli folder, create a .env-file and specify the URL to the MongoDB-server

````
MONGO_URL="mongodb+srv://user:password@host/database?authSource=admin"
````

#### Run CLI
```bash
cd cli
npx ts-node charlee.ts user-create john.doe@charlee.app "John Doe" "admin"
```



 
## Environment variables

| Variable | Description 
|--|--
|NODE_ENV  |development or production  |
|MONGO_URL  |Connection URL to database  |
|JWT_SIGNINGKEY  | Key used to sign JWT-tokens  |
|JWT_LOGIN_EXPIRES_IN  | Time until login token expires  (eg. 1h) |
|JWT_AUTHTOKEN_EXPIRES_IN  |Time until auth token expires  (eg 24h) |
|EMAIL_SERVER_HOST  | SMTP-server |
|EMAIL_SERVER_PORT  |Port number to SMTP-server |
|EMAIL_SERVER_USER  | Username to SMTP-server |
|EMAIL_SERVER_PASSWORD  | Password to SMTP-server |
|OPENAI_APIKEY  | API-Key to use to OPEN-API |
|OPENAI_MODEL  | Model to use on OPENAI (eg gpt-3.5-turbo) |
|PUBLIC_URL  | URL to charlee server, (eg https://demo.charlee.app) |
|S3_ACCESSKEYID  | S3 Access key |
|S3_SECRETACCESSKEY  | S3 Secret |
|S3_BUCKET  | S3 Bucket |
|S3_ENDPOINT  | Server URL to S3 service, leave empty if AWS is used |
|S3_REGION  | AWS region to use |
|S3_PREFIX  | URL prefix to add to uploade files (eg. charlee-files/) |
|S3_ACL  | ACL to add to uploade files |  

