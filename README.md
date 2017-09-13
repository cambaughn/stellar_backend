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


### Access the remote server

1. `ssh root@[IP address]`

<br><br>

## API Documentation

### Questions

> Questions are the text of the question, along with the relationship to the users

#### Get All Answered Questions

Method: __GET__

Path: `/questions`

#### Get Answered Questions for Specific User

> Used for other user's profiles

Method: __GET__

Path: `/questions/:userId`

#### Get All Questions for Current User

> Used for current user's profile

Method: __GET__

Path: `/questions/current_user`

#### Post New Question

Method: __POST__

Path: `/questions/new`

Expects: `{ text, askerId, answererId }`

<br>

### Answers

> Answers are the video responses to questions

#### Get Individual Answer

> Used for video playback in full-screen modal

Method: __GET__

Path: `/answer/:answerId`

#### Post New Answer

> Used to upload video files from device

Method: __POST__

Path: `/answer/new`

Expects: `{ path, questionId }`
