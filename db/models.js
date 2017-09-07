const Sequelize = require('sequelize');

// Need to import the current sequelize instance from ./init.js
const sequelize = require('./init.js').sequelize;

// -------------------------------------- USERS

const User = sequelize.define('user', {
  name: {
    type: Sequelize.STRING
  },
  username: {
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
  profile_photo: {
    type: Sequelize.STRING
  },
  admin: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  }
});

// User.hasMany(User, {as: 'Followers'})


// -------------------------------------- FOLLOWERS

const Follower = sequelize.define('follower', {
});

Follower.belongsTo(User, { as: 'follower'});
Follower.belongsTo(User, { as: 'following'});


// -------------------------------------- QUESTIONS

const Question = sequelize.define('question', {
  text: {
    type: Sequelize.STRING,
  },
});

Question.belongsTo(User, { as: 'asker'});
Question.belongsTo(User, { as: 'answerer'});


// -------------------------------------- ANSWERS

const Answer = sequelize.define('answer', {
  path: {
    type: Sequelize.STRING,
  },
});


Answer.belongsTo(Question, { as: 'question' });
Question.hasMany(Answer, {as: 'answers'})


// -------------------------------------- LIKES

const Like = sequelize.define('like', {
});

Like.belongsTo(User, { as: 'user'});
Like.belongsTo(Answer, { as: 'answer'});
User.hasMany(Like, {as: 'likes'});
Answer.hasMany(Like, {as: 'likes'});


// -------------------------------------- VIEWS

const View = sequelize.define('view', {
});

View.belongsTo(Answer, { as: 'answer'});
Answer.hasMany(View, {as: 'views'});


// -------------------------------------- HASHTAGS

const Hashtag = sequelize.define('hashtag', {
});

Hashtag.belongsTo(Question, { as: 'hashtag'});
Question.hasMany(Hashtag, {as: 'hashtags'});



module.exports.User = User;
module.exports.Question = Question;
module.exports.Answer = Answer;
module.exports.Follower = Follower;
module.exports.Like = Like;
module.exports.View = View;
