const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

// Importar esquemas
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

// Middleware
app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', function (req, res) {
  let tipo = req.params.tipo;
  let id = req.params.id;
  // Si no hay archivos
  if (!req.files) {
    return res.status(400).json({
      ok: false,
      err: {
        message: 'No se ha seleccionado ningún archivo'
      }
    });
  }
  // Validar tipo
  let tiposValidos = ['productos', 'usuarios'];
  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: 'Los tipos permitidos son: ' + tiposValidos.join(', ')
      }
    });
  }
  // Cargar archivo desde un input llamado "archivo"
  let archivo = req.files.archivo;
  let nombreCortado = archivo.name.split('.');
  let extension = nombreCortado[nombreCortado.length - 1];
  // Extensiones permitidas
  let extensionesValidas = ['png', 'jpg', 'jpeg'];
  if (extensionesValidas.indexOf(extension) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: 'Las extensiones de archivo permitidas son: ' + extensionesValidas.join(', '),
        extension: extension
      }
    });
  }
  // Cambiar nombre del archivo (único)
  let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;
  // Usar el método mv() para colocar el archivo en la ruta determinada
  archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err: err
      });
    }
    // Aquí ya se cargó la imagen
    if (tipo === 'usuarios') {
      imagenUsuario(id, res, nombreArchivo);
    }
    else {
      imagenProducto(id, res, nombreArchivo);
    }
  });
});

function imagenUsuario(id, res, nombreArchivo) {
  Usuario.findById(id, (err, usuarioDB) => {
    if (err) {
      borrarArchivo(nombreArchivo, 'usuarios');
      return res.status(500).json({
        ok: false,
        err: err
      });
    }
    if (!usuarioDB) {
      borrarArchivo(nombreArchivo, 'usuarios');
      return res.status(400).json({
        ok: false,
        err: {
          message: 'El usuario no existe'
        }
      });
    }
    // Verificar que el archivo exista
    borrarArchivo(usuarioDB.img, 'usuarios');
    usuarioDB.img = nombreArchivo;
    usuarioDB.save((err, usuarioGuardado) => {
      res.json({
        ok: true,
        usuario: usuarioGuardado,
        img: nombreArchivo
      });
    });
  });
}

function imagenProducto(id, res, nombreArchivo) {
  Producto.findById(id, (err, productoDB) => {
    if (err) {
      borrarArchivo(nombreArchivo, 'productos');
      return res.status(500).json({
        ok: false,
        err: err
      });
    }
    if (!productoDB) {
      borrarArchivo(nombreArchivo, 'productos');
      return res.status(400).json({
        ok: false,
        err: {
          message: 'El producto no existe'
        }
      });
    }
    // Verificar que el archivo exista
    borrarArchivo(productoDB.img, 'productos');
    productoDB.img = nombreArchivo;
    productoDB.save((err, productoGuardado) => {
      res.json({
        ok: true,
        producto: productoGuardado,
        img: nombreArchivo
      });
    });
  });
}

function borrarArchivo(nombreImagen, tipo) {
  let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
  if (fs.existsSync(pathImagen)) {
    fs.unlinkSync(pathImagen);
  }
}

module.exports = app;
