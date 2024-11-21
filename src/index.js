const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const collection = require('./config'); // Certifique-se de que esse arquivo de configuração está correto

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();

app.use((req, res, next) => {
  if (req.path === '/output.css') {
    res.setHeader('Content-Type', 'text/css');
  }
  next();
});


// Configuração para dados JSON e URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuração do EJS como motor de visualização
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Definir corretamente o diretório de views

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configurar BrowserSync somente em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  const browserSync = require('browser-sync').create();

  browserSync.init({
    proxy: 'http://localhost:3000',
    files: ['public/**/*.*', 'views/**/*.*'],
    port: 3001,
    open: false,
    notify: false,
    serveStatic: ['public'],
  });
}

// Rotas
app.get('/', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/home', (req, res) => {
  res.render('home');
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
      return res.send('Esse usuário já existe. Por favor, use outro nome.');
    }

    // Criptografar a senha
    const saltRounds = 10;
    data.password = await bcrypt.hash(data.password, saltRounds);

    // Inserir dados no banco de dados
    await collection.insertMany(data);
    res.send('Cadastro realizado com sucesso!');
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
      return res.send('Nome de usuário não encontrado!');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

    if (isPasswordValid) {
      res.render('home');
    } else {
      res.send('Senha inválida!');
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
