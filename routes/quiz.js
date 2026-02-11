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
router.get("/novo", (req, res) => {
    res.render("quiz/novo");
});
router.post("/novo", async (req, res) => {
    try {
        const { pergunta, opcoes, respostaCorreta } = req.body;
        const quiz = new Quiz({
            pergunta,
            opcoes: opcoes.split(",").map(o => o.trim()),
            respostaCorreta: parseInt(respostaCorreta)
        });
        await quiz.save();
        req.flash("success_msg", "Quiz criado com sucesso!");
        res.redirect("/quiz");
    } catch (err) {
        console.error("Erro ao criar quiz:", err);
        req.flash("error_msg", "Erro ao salvar quiz.");
        res.redirect("/quiz/novo");
    }
});

router.get("/", async (req, res) => {
    try {
        const quizzes = await Quiz.find().lean();
        res.render("quiz/index", { quizzes });
    } catch (err) {
        req.flash("error_msg", "Erro ao carregar quizzes");
        res.redirect("/");
    }
});



// rota POST para verificar respostas
router.post("/responder", async (req, res) => {
    try {
        console.log("Respostas recebidas:", req.body); // debug

        const respostas = req.body;
        const perguntas = await Quiz.find().lean();
        let score = 0;

        perguntas.forEach((p, i) => {
            // só compara se a resposta existir
            if (respostas[`q${i}`] !== undefined &&
                parseInt(respostas[`q${i}`]) === p.respostaCorreta) {
                score++;
            }
        });

        res.render("quiz/resultado", { score, total: perguntas.length });
    } catch (err) {
        console.error("Erro ao processar respostas:", err);
        res.status(500).send("Erro interno ao calcular resultado.");
    }
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
