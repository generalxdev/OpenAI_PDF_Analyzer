const express = require('express');
const multer = require('multer');
const fs = require('fs');
const pdfParser = require('pdf-parse'); // You may need a library like this
const axios = require('axios');
const { Configuration, OpenAIApi } = require("openai");

const app = express();
const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
    res.send("Hello World");
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

async function getOpenAIResponse(promptContent, res) {
  const configuration = new Configuration({
    apiKey: "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",
  });
  const openai = new OpenAIApi(configuration);

  console.log('------------------------');
  console.log('waiting for genie: asked prompt content below');
  console.log(promptContent);

  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "system", content: "You are a helpful assistant." }, { role: "user", content: promptContent }],
  });

  res.json({pdfData: promptContent, genieData: chatCompletion.data.choices[0].message.content});
}

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParser(dataBuffer); // Parse PDF to text

    getOpenAIResponse(data.text, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(5000, () => console.log('Server started on port 5000'));
