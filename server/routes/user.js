let express = require('express');
let router = express.Router();

const models = require('../../db/models');
const checkFollowing = require('../util/checkFollowing');

// Get all users
router.get('/all', function (request, response) {
  // Session not working currently
  // sess = sess || request.session;
  models.User.findAll({ attributes: ['name', 'email', 'id', 'username']}).then(users => {
    response.send(users);
  })
})

// Update user settings
router.post('/update', function (request, response) {
  let { id, name, email, bio } = request.body;
  let updates = { name, email, bio };

  models.User.findOne({ where: { id: id }})
  .then(user => {
    user.update(updates)
      .then(user => {
        response.send({message: user})
      })
  })
})

// Get user profile data - not including questions
router.post('/profile', (request, response) => {

  let { userId, currentUserId } = request.body;

  // Return the specific user
  models.User.findOne({
    where: { id: userId },
    attributes: ['name', 'email', 'bio', 'id', 'username']
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


module.exports = router;
