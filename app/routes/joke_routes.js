// Express docs: http://expressjs.com/en/api.html
const express = require('express')

// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for jokes
const Joke = require('../models/joke')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const errors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = errors.handle404

// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = errors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')

// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `res.joke`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// CREATE
// POST /jokes
router.post('/jokes', requireToken, (req, res, next) => {
  // set owner of new joke to be current joke
  req.body.joke.owner = req.user.id

  Joke.create(req.body.joke)
  // respond to succesful `create` with status 201 and JSON of new "joke"
  .then(joke => {
    res.status(201).json({ joke: joke.toObject() })
  })
  // if an error occurs, pass it off to our error handler
  // the error handler needs the error message and the `res` object so that it
  // can send an error message back to the client
  .catch(next)
})

// INDEX
// GET /jokes
router.get('/jokes', requireToken, (req, res, next) => {
  Joke.find()
    .then(jokes => {
      // `jokes` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return jokes.map(joke => joke.toObject())
    })
    // respond with status 200 and JSON of the jokes
    .then(jokes => res.status(200).json({ jokes: jokes }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /jokes/5a7db6c74d55bc51bdf39793
router.get('/jokes/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Joke.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "joke" JSON
    .then(joke => res.status(200).json({ joke: joke.toObject() }
    ))
    // if an error occurs, pass it to the handler
    .catch(next)
})

  // UPDATE
  // PATCH /jokes/5a7db6c74d55bc51bdf39793
  router.patch('/jokes/:id', requireToken, removeBlanks, (req, res, next) => {
    // if the client attempts to change the `owner` property by including a new
    // owner, prevent that by deleting that key/value pair
    delete req.body.joke.owner

    Joke.findById(req.params.id)
      .then(handle404)
      .then(joke => {
        // pass the `req` object and the Mongoose record to `requireOwnership`
        // it will throw an error if the current user isn't the owner
        requireOwnership(req, joke)

        // pass the result of Mongoose's `.update` to the next `.then`
        return joke.updateOne(req.body.joke)
      })
      // if that succeeded, return 204 and no JSON
      .then(() => res.sendStatus(204))
      // if an error occurs, pass it to the handler
      .catch(next)
  })

  // DESTROY
  // DELETE /jokes/5a7db6c74d55bc51bdf39793
  router.delete('/jokes/:id', requireToken, (req, res, next) => {
    Joke.findById(req.params.id)
      .then(handle404)
      .then(joke => {
        // throw an error if current user doesn't own `joke`
        requireOwnership(req, joke)
        // delete the example ONLY IF the above didn't throw
        joke.deleteOne()
      })
      // send back 204 and no content if the deletion succeeded
      .then(() => res.sendStatus(204))
      // if an error occurs, pass it to the handler
      .catch(next)
  })

module.exports = router