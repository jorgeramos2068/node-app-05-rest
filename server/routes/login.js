// Librerías
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const Usuario = require('../models/usuario');

// Peticiones
app.post('/login', (req, res) => {
  let body = req.body;
  Usuario.findOne({
    email: body.email
  }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err: err
      });
    }
    // Verificar que el usuario con ese email exista
    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Usuario o contraseña incorrectos'
        }
      });
    }
    // Revisar si contraseña no hace match con la de la BD
    if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Usuario o contraseña incorrectos'
        }
      });
    }
    let token = jwt.sign({
      usuario: usuarioDB
    }, process.env.SEED, { expiresIn: process.env.CADUCIDAD });
    res.json({
      ok: true,
      usuario: usuarioDB,
      token: token
    });
  });
});

module.exports = app;
