
const express = require('express');
let redis = require("redis");
const bodyParser = require('body-parser');
const session = require('express-session');
let RedisStore = require('connect-redis')(session);
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
let client  = redis.createClient();
let fs = require('fs');

var multer  = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('FILE => ', file);
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.mov');
  }
})

var upload = multer({ dest: 'uploads/', storage: storage })

let http = require('http');
let https = require('https');
const app = express();

const models = require('../db/models');

// Import routes
const user = require('./routes/user');
const questions = require('./routes/questions');
const search = require('./routes/search');

const checkFollowing = require('./util/checkFollowing');
let sess;

app.use(bodyParser.json({limit: '50mb'})); // for parsing application/json


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


// ROUTES
app.use('/user', user);
app.use('/questions', questions);
app.use('/search', search);


// ANSWER routes

app.post('/answer/new', upload.single('answer'), (request, response) => {

   models.Answer.create({ path: request.file.path, questionId: request.body.questionId })
    .then(answer => {
      response.send({message: 'GOT VIDEO'})
    })
    .catch(error => {
      console.error(error);
      response.send(error)
    })
})


app.post('/answer/view', (request, response) => {
  let { answerId } = request.body;

  console.log()

  models.View.create({ answerId })
  .then(view => {
    response.send({ message: `Received view.`, view })
  })
  .catch(error => {
    response.send({ message: 'There was an error', error })
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




// app.listen(1337, function () {
//   console.log('Example app listening on port 1337!')
// })

http.createServer(app).listen(1337);
// https.createServer(options, app).listen(1300);
