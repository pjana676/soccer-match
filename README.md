# soccer-match
Assessment Exercise for SSE-Backend
# courses-serve
In this exercise you are required to develop a dummy soccer-match status application in NodeJS.
This application should support following features.

1. Games Dashboard
2. User Registration
3. Game subscription/un-subscription
4. Number of people identification from an image

Setup flow -


Make sure you are in project directory. 

To create an env file, pass command with in repo directory - 
```bash
touch .env
```

create database call `soccer-match` if not exist

write in `.env` file 
```
MONGODB_URI=mongodb://127.0.0.1:27017
DATABASE_NAME=soccer-match
PORT=3000
JWT_SECRET=your-secret
JWT_EXPIRY=2h

DEFAULT_ADMIN_USERNAME=admin_user
DEFAULT_ADMIN_EMAIL=admin@soccer.com
DEFAULT_ADMIN_PASSWORD=A1@sDa01

DJANGO_APPLICATION_BASE_URL=http://127.0.0.1:8000
```

In one-line commend to run the project through docker container is -
```
docker compose up
```

else 

You can run it through manual setup like below steps - 

to populate the exiting course data which in `courses.json`, you need to run command -
```
npm run set
```
Message you could see - `Collection: User, Successfully added.`.
That means `user` collection of mongoDB been created and data also populated from with admin-user to `user` collection

to run the code follow the below command -
```
npm start
```
now you can see code is running on port `3000` with the log message - `Server is running on port: 3000`