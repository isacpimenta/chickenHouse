const mongoose = require("mongoose");

const PedidoSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
        {
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
        },
    ],
    totalPrice: { type: Number, required: true },
    address: { type: String, required: true },
    deliveryType: { type: String, enum: ["Entrega", "Retirada"], required: true },
    status: { type: String, default: "Pendente" },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Pedido", PedidoSchema);
