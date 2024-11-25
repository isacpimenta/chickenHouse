const mongoose = require('mongoose');

// Definir o schema para o Prato do Dia
const DishOfTheDaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // O nome do prato é obrigatório
  },
  description: {
    type: String,
    required: false, // Descrição opcional do prato
  },
  price: {
    type: Number,
    required: true, // Preço obrigatório
  },
  available: {
    type: Boolean,
    default: true, // Indica se o prato está disponível
  },
  createdAt: {
    type: Date,
    default: Date.now, // Data de criação do prato
  },
});

// Criar o modelo com base no schema
const DishOfTheDay = mongoose.model('DishOfTheDay', DishOfTheDaySchema);

module.exports = DishOfTheDay;
