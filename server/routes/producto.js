const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');
let app = express();

let Producto = require('../models/producto');

// GET: Mostrar todos los productos
app.get('/producto', verificaToken, (req, res) => {
  let desde = req.query.from || 0;
  desde = Number(desde);
  let limite = req.query.limite || 10;
  const condicion = {
    disponible: true
  }
  Producto.find(condicion)
    .skip(desde)
    .limit(limite)
    .sort('nombre')
    .populate('categoria', 'descripcion')
    .populate('usuario', 'nombre email')
    .exec((err, productos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err: err
        });
      }
      Producto.count(condicion, (err, total) =>{
        res.json({
          ok: true,
          productos: productos,
          total: total
        });
      });
    });
});

// GET: Obtener producto por ID
app.get('/producto/:id', verificaToken, (req, res) => {
  let id = req.params.id;
  Producto.findById(id)
    .populate('categoria', 'descripcion')
    .populate('usuario', 'nombre email')
    .exec((err, productoDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err: err
        });
      }
      if (!productoDB) {
        return res.status(400).json({
          ok: false,
          err: {
            message: 'Producto no encontrado'
          }
        });
      }
      res.json({
        ok: true,
        producto: productoDB
      });
    });
});

// POST: Crear producto
app.post('/producto', verificaToken, (req, res) => {
  let body = req.body;
  let producto = new Producto({
    nombre: body.nombre,
    precioUni: Number(body.precioUni),
    descripcion: body.descripcion,
    disponible: true,
    categoria: body.categoria,
    usuario: req.usuario._id
  });
  producto.save((err, productoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err: err
      });
    }
    if (!productoDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Producto no válido'
        }
      });
    }
    res.status(201).json({
      ok: true,
      producto: productoDB
    });
  });
});

// PUT: Actualizar producto por ID
app.put('/producto/:id', verificaToken, (req, res) => {
  let id = req.params.id;
  let body = req.body;
  let producto = {
    nombre: body.nombre,
    precioUni: Number(body.precioUni),
    descripcion: body.descripcion,
    disponible: true,
    categoria: body.categoria,
    usuario: req.usuario._id
  };
  const options = {
    new: true,
    runValidators: true
  };
  Producto.findByIdAndUpdate(id, producto, options, (err, productoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err: err
      });
    }
    if (!productoDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Producto no encontrado'
        }
      });
    }
    res.json({
      ok: true,
      producto: productoDB
    });
  });
});

// DELETE: Borrar producto (Borrado lógico. Campo disponible)
app.delete('/producto/:id', verificaToken, (req, res) => {
  let id = req.params.id;
  let producto = {
    disponible: false
  };
  const options = {
    new: true
  };
  Producto.findByIdAndUpdate(id, producto, options, (err, productoBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err: err
      });
    }
    if (!productoBorrado) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Producto no encontrado'
        }
      });
    }
    res.json({
      ok: true,
      producto: productoBorrado,
      message: 'Producto borrado'
    });
  });
});

// Buscar productos
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {
  let termino = req.params.termino;
  let regex = new RegExp(termino, 'i');
  Producto.find({ nombre: regex })
  .populate('categoria', 'descripcion')
  .exec((err, productos) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err: err
      });
    }
    res.json({
      ok: true,
      productos: productos
    });
  });
});

module.exports = app;
