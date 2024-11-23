const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo');
const session = require('express-session'); // Adicionado para sessões
const collection = require('./config'); // Certifique-se de que esse arquivo está configurado corretamente
const fs = require('fs');

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();

// Configuração para dados JSON e URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuração para servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Configuração do EJS como motor de visualização
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Configuração de sessões
app.use(session({
  secret: process.env.SESSION_SECRET, // Mova o segredo para o .env
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }), // URL do MongoDB
  cookie: { secure: process.env.NODE_ENV === 'production' } // Use true em produção
}));

// Configurar BrowserSync somente em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  const browserSync = require('browser-sync').create();

  browserSync.init({
    proxy: `http://localhost:${process.env.PORT || 3000}`,
    files: ['public/**/*.*', '../views/**/*.*'],
    port: 3001,
    open: false,
    notify: false,
  });
}

// Middleware para verificar se o usuário está autenticado
function checkAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    res.redirect('/');
  }
}

// Rotas
app.get('/', (req, res) => {
  res.render('login'); // Renderiza login.ejs
});

app.get('/signup', (req, res) => {
  res.render('signup'); // Renderiza signup.ejs
});

app.get('/minha-conta', checkAuth, async (req, res) => {
  try {
    const user = await collection.findById(req.session.userId); // Buscar o usuário logado
    if (!user) {
      return res.status(404).send('Usuário não encontrado.');
    }
    res.render('minhaConta', { user }); // Renderizar a página com os dados
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    res.status(500).send('Erro ao carregar a página de Minha Conta.');
  }
});



app.get('/home', checkAuth, (req, res) => {
  res.render('home'); // Renderiza home.ejs apenas se o usuário estiver autenticado
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
      req.session.userId = user._id; // Salvar o ID do usuário na sessão
      res.redirect('/home');
    } else {
      res.status(401).send('Senha inválida!');
    }
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).send('Erro ao realizar login.');
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao encerrar sessão:', err);
      return res.status(500).send('Erro ao encerrar sessão');
    }
    res.redirect('/'); // Redireciona para a página de login
  });
});

app.post('/minha-conta', checkAuth, async (req, res) => {
  try {
    const { username, email, password, phone, cep, birthDate, gender } = req.body;

    // Verificar se o usuário quer atualizar a senha
    let hashedPassword = undefined;
    if (password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    // Atualizar os dados do usuário no banco de dados
    await collection.findByIdAndUpdate(req.session.userId, {
      name: username,
      email,
      phone,
      cep,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      gender,
      ...(password && { password: hashedPassword }) // Atualiza a senha apenas se for enviada
    });

    res.redirect('/home'); // Redireciona para a página inicial
  } catch (error) {
    console.error('Erro ao atualizar dados do usuário:', error);
    res.status(500).send('Erro ao atualizar os dados.');
  }
});



// Iniciar servidor
const port = process.env.PORT || 3000; // Porta configurável via variável de ambiente
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
