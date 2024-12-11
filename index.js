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


const corsOptions = {
  origin: ['https://life-vault.vercel.app/'], // Reemplaza con tu dominio en Vercel
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
};

app.use(cors(corsOptions));


app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});