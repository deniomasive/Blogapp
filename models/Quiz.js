const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Quiz = new Schema({
    pergunta: { type: String, required: true },
    opcoes: [{ type: String, required: true }],
    respostaCorreta: { type: Number, required: true }
});

mongoose.model("quizzes", Quiz);
