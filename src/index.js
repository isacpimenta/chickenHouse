const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const collection = require('./config'); // Certifique-se de que esse arquivo está configurado corretamente
const fs = require('fs');

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();

// Configuração para dados JSON e URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuração para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para verificar a existência do arquivo CSS (opcional, já que serve arquivos estáticos)
app.use('/output.css', (req, res, next) => {
  const filePath = path.join(__dirname, 'public', 'output.css');
  if (!fs.existsSync(filePath)) {
    console.error(`Arquivo CSS não encontrado: ${filePath}`);
    return res.status(404).send('Arquivo CSS não encontrado.');
  }
  next();
});

// Configuração do EJS como motor de visualização
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views')); // Corrigido para apontar para src/views

// Configurar BrowserSync somente em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  const browserSync = require('browser-sync').create();

  browserSync.init({
    proxy: `http://localhost:${process.env.PORT || 3000}`,
    files: ['public/**/*.*', '../views/**/*.*'], // Corrigido o caminho para src/views
    port: 3001,
    open: false,
    notify: false,
  });
}

// Rotas
app.get('/', (req, res) => {
  res.render('login'); // Renderiza login.ejs
});

app.get('/signup', (req, res) => {
  res.render('signup'); // Renderiza signup.ejs
});

app.get('/home', (req, res) => {
  res.render('home'); // Renderiza home.ejs
});

// Cadastro de usuário
app.post('/signup', async (req, res) => {
  const data = {
    name: req.body.username,
    password: req.body.password,
  };

  try {
    // Verificar se o usuário já existe
    const existingUser = await collection.findOne({ name: data.name });

    if (existingUser) {
      return res.status(400).send('Esse usuário já existe. Por favor, use outro nome.');
    }

    // Criptografar a senha
    const saltRounds = 10;
    data.password = await bcrypt.hash(data.password, saltRounds);

    // Inserir dados no banco de dados
    await collection.insertMany([data]); // Corrigido para enviar um array
    res.redirect('/');
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).send('Erro ao cadastrar o usuário.');
  }
});

// Login de usuário
app.post('/login', async (req, res) => {
  try {
    // Verificar nome de usuário
    const user = await collection.findOne({ name: req.body.username });

    if (!user) {
      return res.status(404).send('Nome de usuário não encontrado!');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

    if (isPasswordValid) {
      res.redirect('/home');
    } else {
      res.status(401).send('Senha inválida!');
    }
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).send('Erro ao realizar login.');
  }
});

// Iniciar servidor
const port = process.env.PORT || 3000; // Porta configurável via variável de ambiente
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
