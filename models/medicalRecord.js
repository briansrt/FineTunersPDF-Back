const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({}, { strict: false });
const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

module.exports = { MedicalRecord };