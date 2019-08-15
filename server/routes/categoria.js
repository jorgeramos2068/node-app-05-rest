const express = require('express');

const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');
let app = express();

let Categoria = require('../models/categoria');

// Mostrar todas categorías
app.get('/categoria', verificaToken, (req, res) => {
  Categoria.find({})
    .sort('descripcion')
    .populate('usuario', 'nombre email')
    .exec((err, categorias) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err: err
        });
      }
      Categoria.count((err, total) => {
        res.json({
          ok: true,
          categorias: categorias,
          total: total
        });
      });
    });
});

// Mostrar una categoría por id
app.get('/categoria/:id', verificaToken, (req, res) => {
  let id = req.params.id;
  Categoria.findById(id, (err, categoriaDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err: err
      });
    }
    if (!categoriaDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Categoría no encontrada'
        }
      });
    }
    res.json({
      ok: true,
      categoria: categoriaDB
    });
  });
});

// Crear nueva categoría
app.post('/categoria', [verificaToken, verificaAdminRole], (req, res) => {
  let body = req.body;
  let categoria = new Categoria({
    descripcion: body.descripcion,
    usuario: req.usuario._id
  });
  categoria.save((err, categoriaDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err: err
      });
    }
    if (!categoriaDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Categoría no encontrada'
        }
      });
    }
    res.json({
      ok: true,
      categoria: categoriaDB
    });
  });
});

// Actualizar categoría
app.put('/categoria/:id', [verificaToken, verificaAdminRole], (req, res) => {
  let id = req.params.id;
  let body = req.body;
  let categoria = {
    descripcion: body.descripcion
  }
  const options = {
    new: true,
    runValidators: true
  }
  Categoria.findByIdAndUpdate(id, categoria, options, (err, categoriaDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err: err
      });
    }
    if (!categoriaDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Categoría no encontrada'
        }
      });
    }
    res.json({
      ok: true,
      categoria: categoriaDB
    });
  });
});

// Borrar categoría
app.delete('/categoria/:id', [verificaToken, verificaAdminRole], (req, res) => {
  let id = req.params.id;
  Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err: err
      });
    }
    if (!categoriaBorrada) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Categoría no encontrada'
        }
      });
    }
    res.json({
      ok: true,
      message: 'Categoría borrada'
    });
  });
});

module.exports = app;