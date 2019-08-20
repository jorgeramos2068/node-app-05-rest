// =========================
// Verificar token
// =========================
const jwt = require('jsonwebtoken');

let verificaToken = (req, res, next) => {
  // Leer header
  let token = req.get('token'); // Or Authorization
  // Comprobar que el token sea válido
  jwt.verify(token, process.env.SEED, (err, decoded) => {
    if (err) {
      return res.status(401).json({ // Unauthorized
          ok: false,
          err: {
            message: 'Token no válido'
          }
      });
    }
    // La información es correcta
    req.usuario = decoded.usuario;
    next();
  });
};

// =========================
// Verificar si el usuario es administrador
// =========================
let verificaAdminRole = (req, res, next) => {
  let usuario = req.usuario;
  if (usuario.rol !== 'ADMIN_ROLE') {
    return res.status(401).json({ // Unauthorized
      ok: false,
      err: {
        message: 'El usuario no es administrador'
      }
    });
  }
  // El usuario sí es administrador
  next();
};

// =========================
// Verificar el token para imagen por URL
// =========================
let verificaTokenImg = (req, res, next) => {
  let token = req.query.token;
  // Comprobar que el token sea válido
  jwt.verify(token, process.env.SEED, (err, decoded) => {
    if (err) {
      return res.status(401).json({ // Unauthorized
          ok: false,
          err: {
            message: 'Token no válido'
          }
      });
    }
    // La información es correcta
    req.usuario = decoded.usuario;
    next();
  });
};

module.exports = {
  verificaToken,
  verificaAdminRole,
  verificaTokenImg
}
