const mongoose = require('mongoose');

const dishOfTheDaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,  // Campos obrigatórios
  },
  description: {
    type: String,
    required: false, // Pode ser opcional
  },
  price: {
    type: Number,
    required: true,  // Campos obrigatórios
  },
  image: {
    type: String,
    required: false, // Pode ser opcional
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('DishOfTheDay', dishOfTheDaySchema);
