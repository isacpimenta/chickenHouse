const express = require('express');
const { checkAuth, checkAdmin } = require('../middlewares/authMiddleware'); // Middleware de autenticação e verificação de admin
const Pedido = require('../models/Pedido'); // Modelo Pedido
const DishOfTheDay = require('../models/DishOfTheDay'); // Modelo DishOfTheDay
const router = express.Router();

// Log de debug para verificar se está entrando na rota
console.log("entrou em admin routes");

// Aplicar o middleware checkAuth e checkAdmin nas rotas administrativas
router.use(checkAuth, checkAdmin);

// Página principal de administração
router.get('/', (req, res) => {
  res.render('admin/home'); // Renderiza a view admin/home
});

// Dashboard de pedidos
router.get('/dashboard', async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ createdAt: -1 });
    res.render('admin/adminPedidos', { pedidos });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).send('Erro ao carregar pedidos da administração.');
  }
});

// Rota POST para atualizar o status de um pedido
router.post('/pedidos/:id/status', async (req, res) => {
  try {
    const pedidoId = req.params.id;
    const { status } = req.body;

    const pedido = await Pedido.findByIdAndUpdate(pedidoId, { status }, { new: true });

    if (!pedido) {
      return res.status(404).send({ error: "Pedido não encontrado" });
    }

    res.status(200).send({ message: "Status atualizado com sucesso", pedido });
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);
    res.status(500).send({ error: "Erro interno no servidor" });
  }
});

// Rota GET para exibir o prato do dia
router.get("/admin/pratoDia", checkAdmin, async (req, res) => {
  console.log('Entrou na rota /admin/pratoDia'); 
  try {
    const dish = await DishOfTheDay.findOne().sort({ date: -1 });
    res.render("admin/adminPrato", { dish });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao carregar a página do prato do dia.");
  }
});

// Rota POST para criar ou atualizar o prato do dia
router.post("/admin/pratoDia", async (req, res) => {
  const { name, description, price, image } = req.body;

  try {
    // Verifica se já existe um prato do dia
    let dish = await DishOfTheDay.findOne().sort({ date: -1 });

    if (dish) {
      // Se já existir, atualiza
      dish.name = name;
      dish.description = description;
      dish.price = price;
      dish.image = image;
      await dish.save();
      return res.redirect("/admin/pratoDia"); // Redireciona corretamente para a página de administração do prato
    }

    // Se não existir, cria um novo prato
    await DishOfTheDay.create({ name, description, price, image });
    res.redirect("/admin/pratoDia"); // Redireciona corretamente para a página de administração do prato
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao salvar o prato do dia.");
  }
});

module.exports = router;