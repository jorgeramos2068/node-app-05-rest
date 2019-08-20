const express = require('express');
const fs = require('fs');
const path = require('path');
const { verificaTokenImg } = require('../middlewares/autenticacion');

let app = express();

// Ruta para servir imágenes
app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {
  let tipo = req.params.tipo;
  let img = req.params.img;
  let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);
  // Verificar que la imagen exista
  if (fs.existsSync(pathImagen)) {
    res.sendFile(pathImagen);
  }
  else {
    let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg');
    res.sendFile(noImagePath);
  }
});

module.exports = app;
