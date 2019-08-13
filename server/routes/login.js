// Librerías
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);
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

// Configuraciones de Google
async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  };
}

// Ruta especial para autenticar con Google
app.post('/google', async (req, res) => {
  let token = req.body.idtoken;
  let googeUser = await verify(token)
    .catch(err => {
      return res.status(403).json({
        ok: false,
        err: err
      });
    });
  // Verificar si no hay un usuario con ese correo
  Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err: err
      });
    }
    // Si ya existe el usuario
    if (usuarioDB) {
      // ¿Se ha autenticado por Google?
      if (usuarioDB.google === false) {
        return res.status(400).json({
          ok: false,
          err: {
            message: 'Debe de usar su autenticación normal'
          }
        });
      }
      // Ya se autenticó con Google, renovar token
      else {
        let token = jwt.sign({
          usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD });
        return res.json({
          ok: true,
          usuario: usuarioDB,
          token: token
        });
      }
    }
    // Si el usuario no existe en nuestra DB, crea nuevo usuario
    else {
      let usuario = new Usuario();
      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = true;
      usuario.password = 'xxx';
      usuario.save((err, usuarioDB) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            err: err
          });
        }
        let token = jwt.sign({
          usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD });
        return res.json({
          ok: true,
          usuario: usuarioDB,
          token: token
        });
      });
    }
  });
});

module.exports = app;
