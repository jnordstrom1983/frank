 

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
npx ts-node frank.ts user-create john.doe@frank.app "John Doe" "admin"
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
|PUBLIC_URL  | URL to frank server, (eg https://demo.frank.se) |
|S3_ACCESSKEYID  | S3 Access key |
|S3_SECRETACCESSKEY  | S3 Secret |
|S3_BUCKET  | S3 Bucket |
|S3_ENDPOINT  | Server URL to S3 service, leave empty if AWS is used |
|S3_REGION  | AWS region to use |
|S3_PREFIX  | URL prefix to add to uploade files (eg. frank-files/) |
|S3_ACL  | ACL to add to uploade files |  
|S3_LOCATIONTEMPLATE    | Template to override the format of the location url retured from the s3 client. {path} will be replaced with the file path |
|EMAIL_DEFAULT_LANGUAGE   | Default language to use for emails, defaults to en |
|BRANDING_FRANK   | Brand name to use for Frank, defaults to Frank |


## Theme Environment variables
| Variable | Description 
|--|--
|THEME_BLUE_50 | Theme color blue50 |
|THEME_BLUE_100 | Theme color blue100 |
|THEME_BLUE_200 | Theme color blue200 |
|THEME_BLUE_300 | Theme color blue300 |
|THEME_BLUE_400 | Theme color blue400 |
|THEME_BLUE_500 | Theme color blue500 |
|THEME_BLUE_600 | Theme color blue600 |
|THEME_BLUE_700 | Theme color blue700 |
|THEME_BLUE_800 | Theme color blue800 |
|THEME_BLUE_900 | Theme color blue900 |
|THEME_BLUE_50 | Theme color blue50 |
|THEME_GREEN_100 | Theme color green100 |
|THEME_GREEN_200 | Theme color green200 |
|THEME_GREEN_300 | Theme color green300 |
|THEME_GREEN_400 | Theme color green400 |
|THEME_GREEN_500 | Theme color green500 |
|THEME_GREEN_600 | Theme color green600 |
|THEME_GREEN_700 | Theme color green700 |
|THEME_GREEN_800 | Theme color green800 |
|THEME_GREEN_900 | Theme color green900 |
|THEME_RED_100 | Theme color red100 |
|THEME_RED_200 | Theme color red200 |
|THEME_RED_300 | Theme color red300 |
|THEME_RED_400 | Theme color red400 |
|THEME_RED_500 | Theme color red500 |
|THEME_RED_600 | Theme color red600 |
|THEME_RED_700 | Theme color red700 |
|THEME_RED_800 | Theme color red800 |
|THEME_RED_900 | Theme color red900 |
|THEME_RED_800 | Theme color red800 |
|THEME_RED_900 | Theme color red900 |
|THEME_VERTICAL_LOGO | Vertical logo |
|THEME_HORIZONTAL_LOGO | Horizontal logo |



