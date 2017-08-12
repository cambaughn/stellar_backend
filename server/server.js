
const express = require('express');
let redis = require("redis");
const bodyParser = require('body-parser');
const session = require('express-session');
let RedisStore = require('connect-redis')(session);
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
let client  = redis.createClient();
let fs = require('fs');

var multer  = require('multer')

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.mov')
  }
})

var upload = multer({ dest: 'uploads/', storage: storage })

let http = require('http');
let https = require('https');
const app = express();

const models = require('../db/init.js');
let sess;

app.use(bodyParser.json({limit: '50mb'})); // for parsing application/json
// app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));


// CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


// SESSION
app.use(cookieParser()); // for parsing cookies
app.use(session({
  secret: 'keyboard cat',
  store: new RedisStore({ host: 'localhost', port: 6379, client: client}),
  cookie: { maxAge: 60 * 60 * 1000 },
  resave: false, // don't save session if unmodified
  // saveUninitialized: false, // don't create session until something stored
}))


// USER routes
app.get('/users', function (request, response) {
  sess = sess || request.session;
  console.log('SESSION on all users route =====> ', sess);
  models.User.findAll({ attributes: ['name', 'email', 'id', 'username']}).then(users => {
    response.send(users);
  })
})

app.post('/users/update', function (request, response) {
  let { id, name, email, bio } = request.body;
  let updates = { name, email, bio };
  console.log('ID => ', id);

  models.User.findOne({ where: { id: id }})
  .then(user => {
    user.update(updates)
      .then(user => {
        response.send({message: user})
      })
  })
})

app.post('/user_profile', (request, response) => {

  let { userId, currentUserId } = request.body;

  // Return the specific user
  models.User.findOne({
    where: { id: userId },
    attributes: ['name', 'email', 'bio', 'id']
  })
    .then(user => {
      if (userId !== currentUserId) {
        checkFollowing(currentUserId, userId, isFollowing => {
          let updatedUser = Object.assign({}, user.toJSON(), {following: isFollowing});
          response.send(updatedUser);
        })
      } else {
        response.send(user);
      }
    })
    .catch(error => {
      response.send(error);
    })
})


// QUESTION routes

// This route is now filtering server-side to only return answered questions
app.get('/questions', function (request, response) {
  models.Question.findAll({
    include: [ { model: models.User, as: 'asker'}, { model: models.User, as: 'answerer'}, { model: models.Answer, as: 'Answers', where: { path: { $ne: null } }, attributes: ['id', 'path'] } ],
    attributes: ['text', 'id']
  })
    .then(questions => {
      response.send(questions);
    })
})

// Get other people's questions - filter on backend to only send questions with answers
app.get('/questions/:userId', (request, response) => {
  console.log(request.params.userId)
  models.Question.findAll({
    where: { answererId: request.params.userId},
    include: [ { model: models.User, as: 'asker'}, { model: models.User, as: 'answerer'}, { model: models.Answer, as: 'Answers', where: { path: { $ne: null } }, attributes: ['id', 'path'] } ],
    attributes: ['text', 'id'],
    order: [['updatedAt', 'DESC']]
  })
    .then(questions => {
      response.send(questions);
    })
})

  // Get the current user's questions - get all questions and filter on front end

app.post('/questions/current_user', (request, response) => {
  models.Question.findAll({
    where: { answererId: request.body.userId},
    include: [ { model: models.User, as: 'asker'}, { model: models.User, as: 'answerer'}, { model: models.Answer, as: 'Answers', attributes: ['id', 'path'] } ],
    attributes: ['text', 'id'],
    order: [['updatedAt', 'DESC']]
  })
    .then(questions => {
      response.send(questions);
    })
})

  // POST Question

app.post('/questions/new', (request, response) => {
  let { text, askerId, answererId } = request.body;

  if (text && askerId && answererId) {
    models.Question.findOrCreate({ where: {text, askerId, answererId}})
      .spread((question, created) => {
        response.send(question);
      })
  } else {
    response.send('Error! Missing fields. Please try again.')
  }

})


// ANSWER routes

app.post('/answers/new', upload.single('answer'), (request, response) => {

  console.log(request.body.questionId);

   models.Answer.create({ path: request.file.path, questionId: request.body.questionId })
    .then(answer => {
      response.send({message: 'GOT VIDEO'})
    })
    .catch(error => {
      console.error(error);
      response.send(error)
    })
})

app.get('/answer/:answerPath', (request, response) => {
  console.log(request.params.answerPath);

  // response.set('Content-Type', 'video/mp4');
  // fs.createReadStream(`uploads/${request.params.answerPath}`).pipe(response);

  // response.send(answer.path)

  response.sendFile(`/${request.params.answerPath}`, {root: 'uploads'},
  function (error) {
    if (error) {
      console.log('ERROR HERE ---------', error);
    } else {
      console.log('Sent: -------', request.params.answerPath);
    }
  });

})


// LOGIN & SIGNUP routes

app.post('/login', (request, response) => {
  let { email, password } = request.body;

  models.User.findOne({ where: { email: email } })
    .then(user => {
      bcrypt.compare(password, user.password, function(error, result) {
        if (result) { // Passwords match
          sess = request.session;
          sess.user = user.name;
          sess.userId = user.id;
          console.log('SESSION on login =====> ', sess);
          response.statusCode = 200;
          response.send({ name: user.name, bio: user.bio, email: user.email, id: user.id });
        } else { // Passwords do not match
          console.log(error)
          response.statusCode = 404;
          response.send('Incorrect password');
        }
      });
    })
    .catch(error => { // Error finding the user record in the database
      response.statusCode = 404;
      response.send(error);
    })

});



app.post('/signup', (request, response) => {
  let { name, email, password } = request.body;

  bcrypt.hash(request.body.password, 10, function(error, hash) {

    if (error) {
      console.error(error);
    } else {

      models.User.findOrCreate({ where: { email: email }, defaults: { name: name, password: hash}})
        .spread((user, created) => {
          response.statusCode = 201;
          response.send({ id: user.id, name: user.name, email: user.email, id: user.id });
        })
        .catch(error => {
          console.error(error);
          response.statusCode = 500;
          response.send(error);
        })
    }
  });
})




// FOLLOWER routes
app.post('/followers/new', (request, response) => {
  let { followerId, followingId } = request.body;

  if (followerId && followingId) {
    models.Follower.findOrCreate({
      where: { followerId, followingId },
      attributes: ['followerId', 'followingId']
    })
      .spread((follow, created) => {
        response.send(follow);
      })
      .catch(error => {
        response.send(error);
      })
  } else {
    response.send('Error! Missing fields.')
  }
})


app.post('/followers/is_following', (request, response) => {
  let { followerId, followingId } = request.body;

  console.log('FINDING FOLLOW => ', request.body)

  checkFollowing(followerId, followingId, (isFollowing) => response.send(isFollowing))
})

function checkFollowing(followerId, followingId, callback) {
  models.Follower.findOne({
    where: { followerId, followingId }
  })
    .then(follow => {
      callback(!!follow);
    })
    .catch(error => {
      callback(error);
    })
}


// ACTION logging routes

app.post('/actions/new', (request, response) => {
  let { userId, type } = request.body;

  if (userId && type) {
    models.Action.create({ userId, type })
    .then(action => {
      response.send({ message: `Received action.`, type })
    })
    .catch(error => {
      response.send({ message: 'There was an error', error })
    })
  } else {
    response.send({ message: 'There was an error' })
  }
})


// SEARCH routes

app.get('/search/:searchTerm', (request, response) => {
  let searchTerm = request.params.searchTerm;
  console.log(searchTerm)
  models.User.findAll({
    where: {
      name: {
        $or: {
          $like: `%${searchTerm}%`
        }
      }
    }
  })
  .then(users => {
    response.send(users);
  })
  .error(error => {
    response.send({message: 'There was an error'}, error)
  })



})


// app.listen(1337, function () {
//   console.log('Example app listening on port 1337!')
// })

http.createServer(app).listen(1337);
// https.createServer(options, app).listen(1300);
