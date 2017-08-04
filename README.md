# stellar backend

This is the backend of stellar. Repositories and instructions for running the front end applications can be found here:

[Web](https://github.com/cambaughn/stellar)

[Mobile](https://github.com/cambaughn/stellar_app)

## Getting Started

`mysql.server start` to start the mysql server

`mysql -u root -p` to access the mysql terminal

`nodemon server/server.js` to start express server on port 1337

`redis-server` to start the redis server

`redis-cli` to monitor and check values in redis ( `KEYS *` to check keys, `GET key` to see that entry)
