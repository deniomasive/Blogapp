const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // para criptografar senha
require("../models/Usuario");
const passport = require("passport")
const Usuario = mongoose.model("usuarios");
const Postagem = require("../models/Postagem");




router.get("/registro", (req, res) => {
    res.render("usuarios/registro");
});

router.post("/registro", (req, res) => {
    let erros = [];

    if (!req.body.nome || typeof req.body.nome === "undefined" || req.body.nome === null) {
        erros.push({ texto: "Nome inválido" });
    }

    if (!req.body.email || typeof req.body.email === "undefined" || req.body.email === null) {
        erros.push({ texto: "Email inválido" });
    }

    if (!req.body.senha || typeof req.body.senha === "undefined" || req.body.senha === null) {
        erros.push({ texto: "Senha inválida" });
    } else {
        if (req.body.senha.length < 4) {
            erros.push({ texto: "Senha muito curta" });
        }
        if (req.body.senha !== req.body.senha2) {
            erros.push({ texto: "As senhas são diferentes, tente novamente!" });
        }
    }

    if (erros.length > 0) {
        res.render("usuarios/registro", { erros });
    } else {
        Usuario.findOne({ email: req.body.email }).then((usuario) => {
            if (usuario) {
                req.flash("error_msg", "Já existe uma conta com este email.");
                res.redirect("/usuarios/registro");
            } else {
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                });

                // Criptografar senha
                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash("error_msg", "Erro ao salvar usuário.");
                            res.redirect("/usuarios/registro");
                        } else {
                            novoUsuario.senha = hash;
                            novoUsuario.save().then(() => {
                                req.flash("success_msg", "Usuário registrado com sucesso!");
                                res.redirect("/");
                            }).catch((err) => {
                                req.flash("error_msg", "Houve um erro ao registrar o usuário, tente novamente");
                                res.redirect("/usuario/registro");
                            });
                        }
                    });
                });
            }
        });
    }
});

router.get("/login", (req, res) => {
    res.render("usuarios/login")
})

router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)
})

router.get("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.flash("success_msg", "Deslogado com sucesso!");
        res.redirect("/");
    });
});

// rota detalhe da postagem
router.get("/postagem/:id", async (req, res) => {
    try {
        const postagem = await Postagem.findById(req.params.id)
            .populate("categoria")
            .lean();
        res.render("postagem/index", { postagem });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro no servidor");
    }
});

// rota principal de exames: lista todos os anos
router.get("/exames", (req, res) => {
    const anos = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012];
    res.render("exames/index", { anos });
});

// rota para exames de um ano específico
router.get("/exames/:ano", (req, res) => {
    const ano = req.params.ano;
    res.render("exames/ano", { ano });
});

// Matemática I
router.get("/exames/:ano/matematica1", (req, res) => {
    const ano = req.params.ano;
    res.render(`resolucao/${ano}/matematica1`, { ano, exame: "Matemática I UEM" });
});

// Matemática II
router.get("/exames/:ano/matematica2", (req, res) => {
    const ano = req.params.ano;
    res.render(`resolucao/${ano}/matematica2`, { ano, exame: "Matemática II UEM" });
});

// Matemática III
router.get("/exames/:ano/matematica3", (req, res) => {
    const ano = req.params.ano;
    res.render(`resolucao/${ano}/matematica3`, { ano, exame: "Matemática III UEM" });
});








module.exports = router;
