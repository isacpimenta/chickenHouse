const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Certifique-se de que esse arquivo está configurado corretamente
const fs = require('fs');
const router = express.Router();
const Pedido = require("../models/Pedido"); // Caminho correto para o modelo
const DishOfTheDay = require("../models/DishOfTheDay");
const { checkAuth } = require('../middlewares/authMiddleware'); 

console.log('Arquivo userRoutes.js carregado');

router.get('/minha-conta', checkAuth, async (req, res) => {
  console.log('Usuário autenticado com ID:', req.session.userId);
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send('Usuário não encontrado.');
    }
    res.render('minhaConta', { user });
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    res.status(500).send('Erro ao carregar a página de Minha Conta.');
  }
});

module.exports = router;


// Rota para 'home'
router.get('/home', checkAuth, (req, res) => {
    res.render('home'); // Renderiza home.ejs apenas se o usuário estiver autenticado
});

// Rota para 'pedidos'
router.get('/pedidos', checkAuth, async (req, res) => {
    try {
      const pedidos = await Pedido.find({ userId: req.session.userId }).sort({ createdAt: -1 });
      res.render('./pedidos', { pedidos });
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      res.status(500).send('Erro ao carregar os pedidos.');
    }
});

// Rota para exibir o prato do dia
router.get("/prato-Dia", async (req, res) => {
  try {
    const dish = await DishOfTheDay.findOne().sort({ date: -1 }); // Busca o prato mais recente
    if (!dish) {
      return res.render("dishOfTheDay", { dish: null, message: "Nenhum prato do dia encontrado." });
    }

    res.render("dishOfTheDay", { dish, message: null });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao buscar o Prato do Dia.");
  }
});

// Rota POST para 'minha-conta'
router.post('/minha-conta', checkAuth, async (req, res) => {
    console.log("Requisição recebida:", req.body);
    try {
      const { username, email, password, phone, cep, birthDate, addressNumber, referencePoint, gender } = req.body;
  
      // Verificar se o usuário quer atualizar a senha
      let hashedPassword = undefined;
      if (password) {
        const saltRounds = 10;
        hashedPassword = await bcrypt.hash(password, saltRounds);
      }
  
      // Atualizar os dados do usuário no banco de dados
      await User.findByIdAndUpdate(req.session.userId, {
        name: username,
        email,
        addressNumber,
        referencePoint,
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

