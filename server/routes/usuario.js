const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const app = express();
const Usuario = require('../models/usuario');
// Importar middleware para importar token
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');

app.get('/usuario', verificaToken, (req, res) => {
  let desde = req.query.desde || 0;
  desde = Number(desde);
  let limite = req.query.limite || 5;
  limite = Number(limite);
  const condicion = {
    estado: true
  };
  Usuario.find(condicion, 'nombre email rol estado google img')
  .skip(desde)
  .limit(limite)
  .exec((err, usuarios) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err: err
      });
    }
    // Contar el total de registros
    Usuario.count(condicion, (err, total) => {
      res.json({
        ok: true,
        usuarios: usuarios,
        total: total
      });
    });
  });
});

app.post('/usuario', [verificaToken, verificaAdminRole], (req, res) => {
  let body = req.body;
  let usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    rol: body.rol
  });
  // Guardar en BD
  usuario.save((err, usuarioDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err: err
      });
    }
    res.json({
      ok: true,
      usuario: usuarioDB
    });
  });
});

app.put('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);
  const options = {
    new: true,
    runValidators: true
  };
  Usuario.findByIdAndUpdate(id, body, options, (err, usuarioDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err: err
      });
    }
    res.json({
      ok: true,
      usuario: usuarioDB
    });
  });
});

app.delete('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {
  let id = req.params.id;
  const update = {
    estado: false
  };
  const options = {
    new: true
  };
  Usuario.findByIdAndUpdate(id, update, options, (err, usuarioBorrado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err: err
      });
    }
    if (!usuarioBorrado) {
      return res.status(400).json({
        ok: false,
        err: 'Usuario no encontrado'
      });
    }
    res.json({
      ok: true,
      usuario: usuarioBorrado
    });
  });
});

module.exports = app;