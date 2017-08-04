// This line requires the .env to be able to access the variables there
require('dotenv').config();

// This code will drop the existing db and create a new one - use with caution

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


console.log('logging env variable! => ', process.env.DB_HOST)


sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


// ============================ MODELS ============================

const User = sequelize.define('user', {
  name: {
    type: Sequelize.STRING
  },
  email: {
    type: Sequelize.STRING
  },
  password: {
    type: Sequelize.STRING
  },
  bio: {
    type: Sequelize.STRING
  },
  admin: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  }
});

// User.hasMany(User, {as: 'Followers'})

const Follower = sequelize.define('follower', {
});

Follower.belongsTo(User, { as: 'follower'});
Follower.belongsTo(User, { as: 'following'});


const Question = sequelize.define('question', {
  text: {
    type: Sequelize.STRING,
  },
});

Question.belongsTo(User, { as: 'asker'});
Question.belongsTo(User, { as: 'answerer'});


const Answer = sequelize.define('answer', {
  path: {
    type: Sequelize.STRING,
  },
});


Answer.belongsTo(Question, { as: 'question' });
Question.hasMany(Answer, {as: 'Answers'})

const Like = sequelize.define('like', {
});

Like.belongsTo(User, { as: 'user'});
Like.belongsTo(Answer, { as: 'answer'});
Like.belongsTo(Question, { as: 'question'});


const Action = sequelize.define('action', {
  type: Sequelize.STRING,
});

Action.belongsTo(User, { as: 'user'});
User.hasMany(Action, {as: 'actions'});

// ============================ Setup + Test ============================

// force: true will drop the table if it already exists
// the match regex will only do so if the db contains _test, will not do so in production
sequelize.sync({ force: true, match: /_test$/ }).then(() => {
  // Table created
  console.log('All tables created')

  User.create({ name: 'Luke Skywalker', email: 'luke@gmail.com', bio: 'I am a Jedi, like my father before me' })

  User.create({ name: 'Obi-Wan Kenobi', email: 'obi-wan@gmail.com', bio: 'You must do what you feel is right, of course.' })

  User.create({ name: "Anakin Skywalker", email: "anakin@gmail.com", password: "$2a$10$/STx6KrERzjZb3wAaI0yqujRmtURSo2QMoRYW8k0VFoIen1xm7R2G", bio: 'This is where the fun begins.' })
  // password: ihatesand

  Question.create({
    text: 'Use the force, Luke.',
    askerId: 2,
    answererId: 1
  })

  Question.create({
    text: 'No, I am your father.',
    askerId: 3,
    answererId: 1
  })

  Question.create({
    text: 'I have a bad feeling about this.',
    askerId: 2,
    answererId: 3
  })

  Question.create({
    text: 'Obi-Wan, may the force be with you.',
    askerId: 3,
    answererId: 2
  })

  Question.create({
    text: 'Do you know anything about an Obi-Wan Kenobi?',
    askerId: 1,
    answererId: 2
  })

  Follower.create({
    followerId: 2,
    followingId: 1
  })

  Answer.create({
    path: 'answer-1500086355570.mp4',
    questionId: 1
  })

  Answer.create({
    path: 'answer-1500086355570.mp4',
    questionId: 5
  })

});



module.exports.sequelize = sequelize;
module.exports.User = User;
module.exports.Question = Question;
module.exports.Answer = Answer;
module.exports.Follower = Follower;
module.exports.Like = Like;
module.exports.Action = Action;
