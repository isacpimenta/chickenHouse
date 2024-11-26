// adminRoutes.js
const express = require('express');
const { checkAuth, checkAdmin } = require('../middlewares/authMiddleware');
const Pedido = require('../models/Pedido'); // Importação do modelo Pedido
const User = require('../models/User'); // Importação do modelo User
const router = express.Router();

console.log("entrou em admin routes")

// Aplicar o middleware checkAuth e checkAdmin nas rotas administrativas
router.use(checkAuth, checkAdmin);

// Página principal de administração
router.get('/', (req, res) => {
  res.render('admin/home'); // Renderiza a view admin/home
});

router.get('/dashboard', async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ createdAt: -1 });
    res.render('admin/adminPedidos', { pedidos });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).send('Erro ao carregar pedidos da administração.');
  }
});



module.exports = router;
