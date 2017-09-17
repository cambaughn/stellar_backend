const models = require('../../db/models');


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

module.exports = checkFollowing;
