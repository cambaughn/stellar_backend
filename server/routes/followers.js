let express = require('express');
let router = express.Router();

const models = require('../../db/models');
const checkFollowing = require('../util/checkFollowing');

router.post('/new', (request, response) => {
  let { followerId, followingId } = request.body;

  if (followerId && followingId) {
    models.Follower.findOrCreate({
      where: { followerId, followingId },
      attributes: ['followerId', 'followingId']
    })
      .spread((follow, created) => {
        response.send({follow, created});
      })
      .catch(error => {
        response.send(error);
      })
  } else {
    response.send('Error! Missing fields.')
  }
})


router.post('/is_following', (request, response) => {
  let { followerId, followingId } = request.body;

  console.log('FINDING FOLLOW => ', request.body);

  checkFollowing(followerId, followingId, (isFollowing) => response.send(isFollowing))
})

module.exports = router;
