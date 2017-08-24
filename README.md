# stellar backend

This is the backend of stellar. Repositories and instructions for running the front end applications can be found here:

[Web](https://github.com/cambaughn/stellar)

[Mobile](https://github.com/cambaughn/stellar_app)

## Getting Started

### Installation

1. From the root of this directory, run `yarn` or `npm install` to install packages

### Running the app

1. `mysql.server start` to start the mysql server

2. `mysql -u root -p` to access the mysql terminal

3. `nodemon server/server.js` to start express server on port 1337

> Currently not using the redis server. 4 and 5 not necessary.

4. `redis-server` to start the redis server

5. `redis-cli` to monitor and check values in redis ( `KEYS *` to check keys, `GET key` to see that entry)
