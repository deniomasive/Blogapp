const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostagemSchema = new Schema({
    titulo: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: "Categoria", // usa o nome do modelo Categoria
        required: true
    },
    data: {
        type: Date,
        default: Date.now
    }
});

// Exporta corretamente o modelo
module.exports = mongoose.model("Postagem", PostagemSchema);
