// jest.setup.js
const dotenv = require('dotenv');
const path = require('path');

// Carica il file .env dalla root del progetto
dotenv.config({ path: path.join(__dirname, '..', '.env') });