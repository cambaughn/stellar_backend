let express = require('express');
let router = express.Router();

const models = require('../../db/models');


// This route is filtering server-side to only return answered questions
router.get('/', function (request, response) {
  models.Question.findAll({
    include: [
      { model: models.User, as: 'asker'},
      { model: models.User, as: 'answerer'},
      { model: models.Answer, as: 'answers', where: { path: { $ne: null } }, attributes: ['id', 'path', 'createdAt'] }
  ],
    attributes: ['text', 'id']
  })
    .then(questions => {
      response.send(questions);
    })
})


// Get a specific user's questions - filter on backend to only send questions with answers
// Do not use for the current user
router.get('/:userId', (request, response) => {
  models.Question.findAll({
    where: { answererId: request.params.userId},
    include: [
      { model: models.User, as: 'asker'},
      { model: models.User, as: 'answerer'},
      { model: models.Answer, as: 'answers', where: { path: { $ne: null } }, attributes: ['id', 'path', 'createdAt'] }
    ],
    attributes: ['text', 'id'],
    order: [['updatedAt', 'DESC']]
  })
    .then(questions => {
      response.send(questions);
    })
})


// Get the current user's questions - get all questions and filter on front end
router.post('/current_user', (request, response) => {
  models.Question.findAll({
    where: { answererId: request.body.userId},
    include: [
      { model: models.User, as: 'asker'},
      { model: models.User, as: 'answerer'},
      { model: models.Answer, as: 'answers', attributes: ['id', 'path', 'createdAt'] }
    ],
    attributes: ['text', 'id', 'createdAt'],
    order: [['updatedAt', 'DESC']]
  })
    .then(questions => {
      response.send(questions);
    })
})


// Post new question
router.post('/new', (request, response) => {
  let { text, askerId, answererId } = request.body;

  if (text && askerId && answererId) {
    models.Question.findOrCreate({ where: {text, askerId, answererId}})
      .spread((question, created) => {
        response.send(question);
      })
  } else {
    response.send({ message: 'Error! Missing fields. Please try again.' })
  }
})

module.exports = router;
