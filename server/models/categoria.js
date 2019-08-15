/**
 * Modelo de categorías
 */
const mongoose = require('mongoose');

// Obtener base para crear esquemas de Mongoose
let Schema = mongoose.Schema;

// Definir esquema
let categoriaSchema = new Schema({
  descripcion: {
    type: String,
    required: [true, 'El nombre de la categoría es obligatorio'],
    unique: true
  },
  usuario: {
    type: Schema.Types.ObjectId, ref: 'Usuario'
  }
});

// Exportar modelo
module.exports = mongoose.model('Categoria', categoriaSchema);
