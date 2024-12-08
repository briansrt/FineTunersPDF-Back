const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class DocumentProcessor {
  static async extractTextFromPDF(buffer) {
    const data = await pdf(buffer);
    console.log(data.text);
    return data.text;
  }

  static async extractTextFromImage(buffer) {
    const { data: { text } } = await Tesseract.recognize(buffer, 'spa');
    return text;
  }

  static async processText(text) {
    const prompt = `
      Convierte el texto en JSON. Texto del egreso:
      ${text}
    `;

    const completion = await openai.chat.completions.create({
      model: "ft:gpt-4o-mini-2024-07-18:personal:gpt-pdfs:AbrIUDHe",
      messages: [
        {
          role: "system",
          content: "Eres un asistente especializado en procesar documentos médicos post-quirúrgicos y extraer información estructurada."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        "type": "json_object"
      },
      temperature: 0.3,
    });

    return JSON.parse(completion.choices[0].message.content);
  }
}

module.exports = DocumentProcessor;