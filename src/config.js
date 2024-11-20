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
    }
});

const collection = new mongoose.model("users", LoginSchema);

module.exports = collection;