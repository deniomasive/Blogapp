const express = require("express");
const { engine } = require("express-handlebars");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const admin = require("./routes/admin");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const Handlebars = require("handlebars");
const passport = require("passport");

require('dotenv').config();


require("./models/Postagem");
const Postagem = mongoose.model("postagens");
require("./models/Categoria");
const Categoria = mongoose.model("categorias");
const usuarios = require("./routes/usuario");
require("./config/auth")(passport);

// Helper para handlebars
Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

// Sessão
app.use(session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    next();
});

// Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Handlebars
app.engine("handlebars", engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Mongoose
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Conectado ao MongoDB Atlas");
}).catch((err) => {
    console.log("Erro ao se conectar: " + err);
});

// Public
app.use(express.static(path.join(__dirname, "public")));

// Rotas
app.get("/", (req, res) => {
    Postagem.find().populate("categoria").sort({ data: "desc" }).lean().then((postagens) => {
        res.render("index", { postagens });
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno");
        res.redirect("/404");
    });
});

app.get("/categorias", (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("categorias/index", { categorias });
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias");
        res.redirect("/");
    });
});

app.get("/categorias/:slug", (req, res) => {
    Categoria.findOne({ slug: req.params.slug }).lean().then((categoria) => {
        if (categoria) {
            Postagem.find({ categoria: categoria._id }).lean().then((postagens) => {
                res.render("categorias/postagens", { postagens, categoria });
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao listar posts.");
                res.redirect("/");
            });
        } else {
            req.flash("error_msg", "Esta categoria não existe");
            res.redirect("/");
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria");
        res.redirect("/");
    });
});

app.get("/postagem/slug", (req, res) => {
    // rota futura
});

app.get("/404", (req, res) => {
    res.send("Erro 404!");
});

app.use("/admin", admin);
app.use("/usuarios", usuarios);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log("SERVIDOR RODANDO na porta " + PORT);
});
