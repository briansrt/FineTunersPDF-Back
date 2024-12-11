const express = require('express');
const multer = require('multer');
const DocumentProcessor = require('../services/documentProcessor.js');
const { MedicalRecord } = require('../models/medicalRecord.js');
const twilio = require('twilio');
require('dotenv').config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


const router = express.Router();
const upload = multer();

router.post('/process-document', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Número de teléfono no proporcionado' });
    }

    let text;
    if (req.file.mimetype === 'application/pdf') {
      text = await DocumentProcessor.extractTextFromPDF(req.file.buffer);
    } else if (req.file.mimetype.startsWith('image/')) {
      text = await DocumentProcessor.extractTextFromImage(req.file.buffer);
    } else {
      return res.status(400).json({ error: 'Formato de archivo no soportado' });
    }

    const processedData = await DocumentProcessor.processText(text);
    const summary = await DocumentProcessor.summarizeText(text);

    // Guardar datos procesados en la base de datos
    const medicalRecord = new MedicalRecord(processedData);
    await medicalRecord.save();

    // Enviar mensaje de WhatsApp
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${phoneNumber}`,
      body: `Resumen del documento procesado:\n\n${summary}`,
    });

    res.json({
      message: 'Documento procesado y mensaje enviado exitosamente',
      data: processedData,
      summary: summary,
    });
  } catch (error) {
    console.error('Error procesando documento:', error);
    res.status(500).json({ error: 'Error procesando el documento' });
  }
});


module.exports = { router };