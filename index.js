const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const { router } = require('./routes/documentRoutes.js');

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

app.use(express.json());
app.use(cors())

app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});