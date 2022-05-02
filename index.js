//Importación
const express = require("express");
const exphbs = require("express-handlebars");
const expressFileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const secretKey = "Shhhhh";
const app = express();

const {
  nuevoUsuario,
  getUsuarios,
  setUsuarioStatus,
  getUsuario,
} = require("./consultas");
const { JsonWebTokenError } = require("jsonwebtoken");
const { send } = require("express/lib/response");
const enviar = require("./correo");

app.listen(3000, console.log("Server on 3000 port"));

//Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.use(
  expressFileUpload({
    limits: 5000000,
    abortOnLimit: true,
    responseOnLimit: "El tamaño de la imagen supera el límite permitido",
  })
);
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main",
    layoutsDir: `${__dirname}/views/mainLayout`,
  })
);
app.set("view engine", "handlebars");

//Rutas
app.get("/", (req, res) => {
  res.render("Home");
});

app.post("/usuarios", async (req, res) => {
  const { email, nombre, password } = req.body;
  try {
    const usuario = await nuevoUsuario(email, nombre, password);
    res.status(201).send(usuario);
  } catch (error) {
    res.status(500).send({
      error: `Algo salió mal... ${error}`,
      code: 500,
    });
  }
});

app.put("/usuarios", async (req, res) => {
  const { id, auth } = req.body;
  try {
    const usuario = await setUsuarioStatus(id, auth);
    res.status(200).send(usuario);
  } catch (error) {
    res.status(500).send({
      error: `Algo salió mal... ${error}`,
      code: 500,
    });
  }
});

app.get("/Admin", async (req, res) => {
  try {
    const usuarios = await getUsuarios();
    res.render("Admin", { usuarios });
  } catch (error) {
    res.status(500).send({
      error: `Algo salió mal... ${error}`,
      code: 500,
    });
  }
});

app.get("/Login", function (req, res) {
  res.render("Login");
});

app.post("/verify", async function (req, res) {
  const { email, password } = req.body;
  const user = await getUsuario(email, password);
  if (user) {
    if (user.auth) {
      const token = jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) + 180,
          data: user,
        },
        secretKey
      );
      res.send(token);
    } else {
      res.status(401).send({
        error: "Este usuario aún no ha sido validado para subir imágenes",
        code: 401,
      });
    }
  } else {
    res.status(404).send({
      error: "Este usuario no está registrado en la base de datos",
      code: 404,
    });
  }
});

app.get("/Evidencias", function (req, res) {
  const { token } = req.query;
  jwt.verify(token, secretKey, (err, decoded) => {
    const { data } = decoded;
    const { nombre, email } = data;
    err
      ? res.status(401).send(
          res.send({
            error: "401 Unauthorized",
            messaege: "Usted no está autorizado para estar aquí",
            token_error: err.message,
          })
        )
      : res.render("Evidencias", { nombre, email });
  });
});

app.post("/upload", (req, res) => {
  if (Object.keys(req.files).length == 0) {
    return res
      .status(400)
      .send("No se encontro ningún archivo en la consulta");
  }
  const { files } = req;
  const { foto } = files;
  const { name } = foto;//name es el nombre del archivo que se sube
  const { email, nombre } = req.body;
  console.log(email);
  foto.mv(`${__dirname}/public/uploads/${name}`, async (err) => {
    if (err)
      return res.status(500).send({
        error: `Algo salió mal... ${err}`,
        code: 500,
      });
    await enviar(email, nombre);
    res.send("Foto cargada con éxito");
  });
});
