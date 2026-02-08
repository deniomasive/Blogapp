const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Definição do Schema
const Categoria = new Schema({
    nome: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Exporta o modelo
mongoose.model("categorias", Categoria);
