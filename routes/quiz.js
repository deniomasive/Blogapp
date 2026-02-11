const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Quiz");
const Quiz = mongoose.model("quizzes");

// rota GET para mostrar quiz
router.get("/", async (req, res) => {
    const perguntas = await Quiz.find().lean();
    res.render("quiz/index", { perguntas });
});

// rota POST para verificar respostas
router.post("/responder", async (req, res) => {
    const respostas = req.body; // objeto com {q0: "0", q1: "2", ...}
    const perguntas = await Quiz.find().lean();
    let score = 0;

    perguntas.forEach((p, i) => {
        if (parseInt(respostas[`q${i}`]) === p.respostaCorreta) {
            score++;
        }
    });

    res.render("quiz/resultado", { score, total: perguntas.length });
});
// rota para inserir perguntas iniciais no banco
router.get("/seed", async (req, res) => {
    try {
        await Quiz.insertMany([
            {
                pergunta: "Qual comando inicia um projeto Node.js?",
                opcoes: ["npm init", "node start", "git init"],
                respostaCorreta: 0
            },
            {
                pergunta: "Qual banco de dados é NoSQL?",
                opcoes: ["MySQL", "MongoDB", "PostgreSQL"],
                respostaCorreta: 1
            },
            {
                pergunta: "Qual framework é usado com Express para templates?",
                opcoes: ["Handlebars", "Django", "Laravel"],
                respostaCorreta: 0
            },
            {
                pergunta: "Qual comando instala pacotes no Node.js?",
                opcoes: ["node install", "npm install", "git install"],
                respostaCorreta: 1
            },
            {
                pergunta: "Qual linguagem o Node.js executa?",
                opcoes: ["Python", "JavaScript", "Ruby"],
                respostaCorreta: 1
            }
        ]);
        res.send("Perguntas inseridas com sucesso!");
    } catch (err) {
        res.status(500).send("Erro ao inserir perguntas: " + err.message);
    }
});


module.exports = router;
