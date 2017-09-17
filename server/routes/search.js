let express = require('express');
let router = express.Router();

const models = require('../../db/models');


router.get('/:searchTerm', (request, response) => {
  let searchTerm = request.params.searchTerm;

  models.User.findAll({
    where: {
      $or: {
        name: {
          $or: {
            $like: `%${searchTerm}%`
          }
        },
        username: {
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



module.exports = router;
