
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
const login = require('./routes/login');
const followers = require('./routes/followers');

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
app.use('/login', login);
app.use('/followers', followers);


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


// app.listen(1337, function () {
//   console.log('Example app listening on port 1337!')
// })

http.createServer(app).listen(1337);
// https.createServer(options, app).listen(1300);
