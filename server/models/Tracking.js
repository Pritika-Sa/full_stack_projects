const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  topic: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  score: Number,
  total: Number,
  date: { type: Date, default: Date.now },
  time: Number,
  responses: [
    {
      question: String,
      selectedOption: String,
      correctAnswer: String,
      isCorrect: Boolean,
      explanation: String
    }
  ]
});

module.exports = mongoose.model('Tracking', trackingSchema);
