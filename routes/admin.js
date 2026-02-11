const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// importa os models
require("../models/Postagem");
const Postagem = mongoose.model("postagens");
const { eAdmin } = require("../helpers/eAdmin")
require("../models/Categoria");
const Categoria = mongoose.model("categorias");

// rota inicial admin
router.get("/", (req, res) => {
    res.render("admin/index");
});

// rota listar categorias
router.get("/categorias", (req, res) => {
    Categoria.find().sort({ date: "desc" }).lean().then((categorias) => {
        res.render("admin/categorias", { categorias });
    }).catch((err) => {
        req.flash("error_msg", "Erro ao listar categorias");
        res.redirect("/admin");
    });
});

// rota formulário adicionar categoria
router.get("/categorias/add", (req, res) => {
    res.render("admin/addcategorias");
});

// rota salvar nova categoria
router.post("/categorias/nova", (req, res) => {
    let erros = [];

    if (!req.body.nome || req.body.nome.length < 2) {
        erros.push({ text: "Nome inválido ou muito pequeno" });
    }

    if (!req.body.slug || !req.body.slug.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)) {
        erros.push({ text: "Slug inválido, use minúsculas, números e hífen" });
    }

    if (erros.length > 0) {
        return res.render("admin/addcategorias", { erros });
    }

    const novaCategoria = { nome: req.body.nome, slug: req.body.slug };

    new Categoria(novaCategoria).save()
        .then(() => {
            req.flash("success_msg", "Categoria salva com sucesso!");
            res.redirect("/admin/categorias");
        })
        .catch((err) => {
            req.flash("error_msg", "Erro ao salvar categoria: " + err);
            res.redirect("/admin");
        });
});

// rota editar categoria
router.get("/categorias/edit/:id", (req, res) => {
    Categoria.findOne({ _id: req.params.id }).lean().then((categoria) => {
        if (!categoria) {
            req.flash("error_msg", "Categoria não encontrada");
            return res.redirect("/admin/categorias");
        }
        res.render("admin/editcategorias", { categoria });
    }).catch((err) => {
        req.flash("error_msg", "Erro ao carregar categoria");
        res.redirect("/admin/categorias");
    });
});

router.post("/categorias/edit", (req, res) => {
    Categoria.findOne({ _id: req.body.id }).then((categoria) => {
        if (!categoria) {
            req.flash("error_msg", "Categoria não encontrada");
            return res.redirect("/admin/categorias");
        }

        categoria.nome = req.body.nome;
        categoria.slug = req.body.slug;

        categoria.save().then(() => {
            req.flash("success_msg", "Categoria editada com sucesso");
            res.redirect("/admin/categorias");
        }).catch((err) => {
            req.flash("error_msg", "Erro ao editar categoria");
            res.redirect("/admin/categorias");
        });
    }).catch((err) => {
        req.flash("error_msg", "Erro ao buscar categoria");
        res.redirect("/admin/categorias");
    });
});

// rota deletar categoria
router.post("/categorias/deletar", (req, res) => {
    Categoria.findByIdAndDelete(req.body.id).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!");
        res.redirect("/admin/categorias");
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar categoria");
        res.redirect("/admin/categorias");
    });
});

// lista de postagens
router.get("/postagens", (req, res) => {
    Postagem.find().populate("categoria").sort({ data: "desc" }).lean().then((postagens) => {
        res.render("admin/postagens", { postagens });
    }).catch((err) => {
        req.flash("error_msg", "Erro ao listar postagens");
        res.redirect("/admin");
    });
});

// formulário para adicionar postagem
router.get("/postagens/add", (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagem", { categorias });
    }).catch((err) => {
        req.flash("error_msg", "Erro ao carregar formulário");
        res.redirect("/admin");
    });
});

// rota salvar nova postagem
router.post("/postagens/nova", (req, res) => {
    let erros = [];

    if (!req.body.titulo || req.body.titulo.trim().length < 3) {
        erros.push({ text: "Título inválido, mínimo 3 caracteres" });
    }

    if (!req.body.slug || !req.body.slug.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)) {
        erros.push({ text: "Slug inválido, use minúsculas, números e hífen" });
    }

    if (!req.body.descricao || req.body.descricao.trim().length < 5) {
        erros.push({ text: "Descrição inválida, mínimo 10 caracteres" });
    }

    if (!req.body.conteudo || req.body.conteudo.trim().length < 5) {
        erros.push({ text: "Conteúdo inválido, mínimo 20 caracteres" });
    }

    if (req.body.categoria == "0") {
        erros.push({ text: "Categoria inválida, registre uma categoria" });
    }

    if (erros.length > 0) {
        Categoria.find().lean().then((categorias) => {
            res.render("admin/addpostagem", { erros, categorias });
        });
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        };

        new Postagem(novaPostagem).save()
            .then(() => {
                req.flash("success_msg", "Postagem criada com sucesso.");
                res.redirect("/admin/postagens");
            })
            .catch((err) => {
                req.flash("error_msg", "Erro ao salvar postagem: " + err.message);
                res.redirect("/admin/postagens/add");
            });
    }
});

// rota carregar formulário de edição
router.get("/postagens/edit/:id", (req, res) => {
    Postagem.findOne({ _id: req.params.id }).lean().then((postagem) => {
        if (!postagem) {
            req.flash("error_msg", "Postagem não encontrada");
            return res.redirect("/admin/postagens");
        }

        Categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagem", { postagem, categorias });
        }).catch((err) => {
            req.flash("error_msg", "Erro ao carregar categorias");
            res.redirect("/admin/postagens");
        });
    }).catch((err) => {
        req.flash("error_msg", "Erro ao carregar postagem");
        res.redirect("/admin/postagens");
    });
});

router.post("/postagens/edit", (req, res) => {
    Postagem.findOne({ _id: req.body.id }).then((postagem) => {
        if (!postagem) {
            req.flash("error_msg", "Postagem não encontrada");
            return res.redirect("/admin/postagens");
        }

        postagem.titulo = req.body.titulo;
        postagem.slug = req.body.slug;
        postagem.descricao = req.body.descricao;
        postagem.conteudo = req.body.conteudo;
        postagem.categoria = req.body.categoria;

        postagem.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso");
            res.redirect("/admin/postagens");
        }).catch((err) => {
            req.flash("error_msg", "Erro ao editar postagem");
            res.redirect("/admin/postagens");
        });
    }).catch((err) => {
        req.flash("error_msg", "Erro ao buscar postagem");
        res.redirect("/admin/postagens");
    });
});

router.post("/postagens/deletar", (req, res) => {
    Postagem.findByIdAndDelete(req.body.id).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso!");
        res.redirect("/admin/postagens");
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar postagem");
        res.redirect("/admin/postagens");
    });
});



module.exports = router;
