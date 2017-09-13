// This line requires the .env to be able to access the variables there
require('dotenv').config();

// The code in this document will drop the existing db and create a new one - use with caution

// Need the model definition from ./models.js
const models = require('./models.js');

// Check if environment variables are available
if (process.env.DB_HOST) {
  console.log('============ Environment variables loaded ============');
} else {
  console.error('============ Environment variables not available ============')
}


const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
});



sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });



// ============================ Setup + Test ============================

// force: true will drop the table if it already exists
// the match regex will only do so if the db contains _test, will not do so in production
sequelize.sync({ force: true, match: /_test$/ }).then(() => {
  // Table created
  console.log('All tables created');

  models.User.create({
    name: 'Luke Skywalker',
    username: 'luke',
    email: 'luke@gmail.com',
    bio: 'I am a Jedi, like my father before me'
  })

  models.User.create({
    name: 'Obi-Wan Kenobi',
    username: 'obiwan',
    email: 'obi-wan@gmail.com',
    bio: 'You must do what you feel is right, of course.'
  })

  models.User.create({
    name: "Anakin Skywalker",
    username: 'ani',
    email: "anakin@gmail.com",
    password: "$2a$10$/STx6KrERzjZb3wAaI0yqujRmtURSo2models.QMoRYW8k0VFoIen1xm7R2G",
    bio: 'This is where the fun begins.'
  })
  // password: ihatesand

  models.Question.create({
    text: 'Use the force, Luke.',
    askerId: 2,
    answererId: 1
  })

  models.Question.create({
    text: 'No, I am your father.',
    askerId: 3,
    answererId: 1
  })

  models.Question.create({
    text: 'I have a bad feeling about this.',
    askerId: 2,
    answererId: 3
  })

  models.Question.create({
    text: 'Obi-Wan, may the force be with you.',
    askerId: 3,
    answererId: 2
  })

  models.Question.create({
    text: 'Do you know anything about an Obi-Wan Kenobi?',
    askerId: 1,
    answererId: 2
  })

  models.Follower.create({
    followerId: 2,
    followingId: 1
  })

  models.Answer.create({
    path: 'answer-1500086355570.mp4',
    questionId: 1
  })

  models.Answer.create({
    path: 'answer-1500086355570.mp4',
    questionId: 5
  })

});


module.exports.sequelize = sequelize;
