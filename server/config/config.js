// ======================
// Configurar puerto
// ======================
process.env.PORT = process.env.PORT || 3000;

// ======================
// Vencimiento del token
// ======================
process.env.CADUCIDAD = 60 * 60 * 24 * 30;

// ======================
// SEED de autenticación
// ======================
process.env.SEED = process.env.SEED || 'dev-seed';
