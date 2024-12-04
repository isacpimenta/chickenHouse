const express = require('express');
const { checkAuth, checkAdmin } = require('../middlewares/authMiddleware'); // Middleware de autenticação e verificação de admin
const Pedido = require('../models/Pedido'); // Modelo Pedido
const DishOfTheDay = require('../models/DishOfTheDay'); // Modelo DishOfTheDay
const router = express.Router();
const multer = require('multer');  // Certifique-se de importar o multer no seu backend
const path = require('path');

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
router.get("/pratoDia", checkAdmin, async (req, res) => {
  console.log('Entrou na rota /admin/pratoDia'); 
  try {
    const dish = await DishOfTheDay.findOne().sort({ date: -1 });
    res.render("admin/adminPrato", { dish });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao carregar a página do prato do dia.");
  }
});

// Configuração do multer para armazenamento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/assets/'); // Diretório de destino para as imagens
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Nome único para o arquivo
  }
});

const upload = multer({ storage: storage });

// Rota POST para salvar ou atualizar o prato do dia
router.post('/pratoDia', upload.single('image'), async (req, res) => {
  console.log("Recebendo requisição POST para /pratoDia");

  const { name, description, price } = req.body;
  const image = req.file ? `/assets/${req.file.filename}` : null; // Verifique se o arquivo foi recebido
  console.log('Caminho da imagem:', image); // Verifique o caminho gerado

  console.log("Body:", req.body); // Verifique os dados recebidos
  console.log("File:", req.file); // Verifique os dados do arquivo recebido

  if (!name || !price) {
    return res.redirect('/admin/pratoDia?toast=error&msg=Nome%20e%20preço%20são%20obrigatórios');
  }

  try {
    let dish = await DishOfTheDay.findOne().sort({ date: -1 });

    if (dish) {
      dish.name = name;
      dish.description = description;
      dish.price = price;
      if (image) dish.image = image; // Se o arquivo foi recebido, atribua a imagem
      await dish.save();
      return res.redirect('/admin/pratoDia?toast=success&msg=Prato%20do%20dia%20atualizado%20com%20sucesso');
    }
  
    await DishOfTheDay.create({ name, description, price, image });
    return res.redirect('/admin/pratoDia?toast=success&msg=Prato%20do%20dia%20criado%20com%20sucesso');
  } catch (error) {
    console.error("Erro ao salvar o prato do dia:", error);
    return res.redirect('/admin/pratoDia?toast=error&msg=Erro%20ao%20salvar%20o%20prato%20do%20dia');
  }
});

// Rota POST para excluir o prato do dia
router.post('/pratoDia/delete', checkAdmin, async (req, res) => {
  try {
    const dish = await DishOfTheDay.findOne().sort({ date: -1 });

    if (!dish) {
      return res.redirect('/admin/pratoDia?toast=error&msg=Não%20há%20prato%20do%20dia%20para%20excluir');
    }

    // Excluir a imagem do arquivo, caso exista
    if (dish.image) {
      const fs = require('fs');
      const path = require('path');
      const imagePath = path.join(__dirname, '..', dish.image); // Caminho completo da imagem

      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Erro ao excluir a imagem:', err);
        } else {
          console.log('Imagem excluída com sucesso');
        }
      });
    }

    // Excluir o prato do dia do banco de dados
    await DishOfTheDay.deleteOne({ _id: dish._id });

    res.redirect('/admin/pratoDia?toast=success&msg=Prato%20do%20dia%20excluído%20com%20sucesso');
  } catch (error) {
    console.error("Erro ao excluir o prato do dia:", error);
    res.redirect('/admin/pratoDia?toast=error&msg=Erro%20ao%20excluir%20o%20prato%20do%20dia');
  }
});



module.exports = router;