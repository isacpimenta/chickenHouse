const mongoose = require("mongoose");

const DB_PASS = "VwFoePkRsKz6CpCY";

const connect = mongoose.connect(`mongodb+srv://isac:${DB_PASS}@cluster0.1sgly.mongodb.net/`)
  .then(() => console.log("Conectado ao MongoDB Atlas"))
  .catch((err) => console.error("Erro ao conectar ao MongoDB Atlas", err));

const LoginSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false
  },
  phone: {
    type: String,
    required: false
  },
  cep: {
    type: String,
    required: false
  },
  addressNumber: { 
    type: String,
    required: false
  },
  referencePoint: { 
    type: String,
    required: false
  },
  birthDate: {
    type: Date,
    required: false
  },
  gender: {
    type: String,
    required: false,
    enum: ["Masculino", "Feminino", "Outro"]
  },
  isAdmin: { // Campo para identificar se o usuário é admin
    type: Boolean,
    default: false
  }
});

const collection = mongoose.model("users", LoginSchema);

module.exports = collection;
