const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const browserSync = require('browser-sync').create();
const collection = require('./config');
const { name } = require('browser-sync');

const app = express();

// convert data into json format
app.use(express.json());

app.use(express.urlencoded({extended: false}));


// Configurar o BrowserSync
browserSync.init({
  proxy: "http://localhost:3000", // Seu servidor Express
  files: ["public/**/*.*", "views/**/*.*"], // Arquivos que o BrowserSync vai monitorar
  port: 3001, // Escolha uma porta para o BrowserSync (não a mesma do Express)
  open: false, // Impede que o navegador abra automaticamente
  notify: false, // Desativa as notificações do BrowserSync
});

// Configuração do EJS
app.set('view engine', 'ejs');

// Rota para login
app.get("/", (req, res) => {
  res.render("login");
});

// Rota para signup
app.get("/signup", (req, res) => {
  res.render("signup");
});

// Rota para home
app.get("/home", (req, res) => {
  res.render("home");
});

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Register user
app.post("/signup", async (req,res) => {
  const data = {
    name: req.body.username,
    password: req.body.password
  }

  // Check if the user already exist in database
  const existingUser = await collection.findOne({name: data.name});

  if(existingUser){
    res.send("Esse usuário já existe. Por favor, use outro nome")
  }
  else {
    // hash the password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    
    data.password = hashedPassword;

    const userdata = await collection.insertMany(data);
    console.log(userdata);
  }

});

// Login user
app.post("/login", async (req, res) => {
  try {
    // Verificar nome de usuário
    const checkUsername = await collection.findOne({ name: req.body.username });
    if (!checkUsername) {
      return res.send("Nome de usuário não encontrado!");
    }

    // Verificar senha
    const checkPassword = await bcrypt.compare(req.body.password, checkUsername.password);
    if (checkPassword) {
      return res.render("home");
    } else {
      return res.send("Senha inválida!");
    }
  } catch (error) {
    console.error("Erro no login:", error); // Log útil para depuração
    return res.send("Credenciais inválidas!");
  }
});


const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
