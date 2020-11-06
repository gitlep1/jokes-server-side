const mongoose = require('mongoose')

const jokeSchema = new mongoose.Schema({
  joke: {
    type: String,
    required: true,
  },
  punchLine: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: String
}, {
  timestamps: true,
})

module.exports = mongoose.model('Joke', jokeSchema)
