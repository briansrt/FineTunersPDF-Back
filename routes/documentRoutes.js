const express = require('express');
const multer = require('multer');
const DocumentProcessor = require('../services/documentProcessor.js');
const { MedicalRecord } = require('../models/medicalRecord.js');

const router = express.Router();
const upload = multer();

router.post('/process-document', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
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
    const medicalRecord = new MedicalRecord(processedData);
    await medicalRecord.save();

    res.json({
      message: 'Documento procesado exitosamente',
      data: processedData
    });
  } catch (error) {
    console.error('Error procesando documento:', error);
    res.status(500).json({ error: 'Error procesando el documento' });
  }
});

module.exports = { router };