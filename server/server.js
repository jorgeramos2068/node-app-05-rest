require('./config/config');

const express = require('express');
const mongoose = require('mongoose');
// Importar path
const path = require('path');

const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Habilitar directorio public/
app.use(express.static(path.resolve(__dirname, '../public')));

// Configuración de rutas
app.use(require('./routes/index'));

// Conexión a la BD
mongoose.connect('mongodb://localhost:27017/cafedb', {useNewUrlParser: true, useCreateIndex: true}, (err, res) => {
  if(err) {
    throw err;
  }
  console.log('Base de datos ONLINE');
});

app.listen(process.env.PORT, () => {
  console.log(`Escuchando puerto ${process.env.PORT}`);
});
