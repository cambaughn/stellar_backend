let express = require('express');
let router = express.Router();
const bcrypt = require('bcrypt');

const models = require('../../db/models');

// Log in existing user

router.post('/', (request, response) => {
  let { email, password } = request.body;

  models.User.findOne({ where: { email: email } })
    .then(user => {
      bcrypt.compare(password, user.password, function(error, result) {
        if (result) { // Passwords match
          // Session code not working currently
          // sess = request.session;
          // sess.user = user.name;
          // sess.userId = user.id;
          response.statusCode = 200;
          response.send({ name: user.name, bio: user.bio, email: user.email, id: user.id });
        } else { // Passwords do not match
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

// Sign up new user

router.post('/new_user', (request, response) => {
  let { name, email, password } = request.body;

  bcrypt.hash(request.body.password, 10, function(error, hash) {
    if (error) {
      console.error(error);
      response.send(error);
    } else {
      models.User.findOrCreate({ where: { email: email }, defaults: { name: name, password: hash}})
        .spread((user, created) => {
          response.statusCode = 201;
          response.send({ id: user.id, name: user.name, email: user.email, id: user.id, created: created });
        })
        .catch(error => {
          console.error(error);
          response.statusCode = 500;
          response.send(error);
        })
    }
  });
})





module.exports = router;
