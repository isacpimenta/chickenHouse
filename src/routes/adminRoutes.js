// adminRoutes.js
const express = require('express');
const { checkAuth, checkAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

// Aplicar o middleware checkAuth e checkAdmin nas rotas administrativas
router.use(checkAuth, checkAdmin);

// Página principal de administração
router.get('/', (req, res) => {
  res.render('admin/home'); // Renderiza a view admin/home
});

// Em adminRoutes.js
router.get('/pedidos', checkAdmin, async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ createdAt: -1 }); // Ou qualquer filtro que você queira
    res.render('admin/adminPedidos', { pedidos });  // Aqui o caminho correto para a view
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).send('Erro ao carregar pedidos da administração.');
  }
});


module.exports = router;
