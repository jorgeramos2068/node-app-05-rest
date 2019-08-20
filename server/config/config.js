// ======================
// Configurar puerto
// ======================
process.env.PORT = process.env.PORT || 3000;

// ======================
// Vencimiento del token
// ======================
process.env.CADUCIDAD = '30 days';

// ======================
// SEED de autenticación
// ======================
process.env.SEED = process.env.SEED || 'dev-seed';

// ======================
// Google Client ID
// ======================
process.env.CLIENT_ID = process.env.CLIENT_ID || 'GoogleClientID';
