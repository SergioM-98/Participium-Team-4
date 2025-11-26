// jest.setup.js
const dotenv = require('dotenv');
const path = require('path');

// Carica le variabili d'ambiente per i test
dotenv.config({ path: path.join(__dirname, '.env.test') });