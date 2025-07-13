const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const pdf = require('html-pdf');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


const replacePlaceholders = (template, data) => {
  return template.replace(/{{(.*?)}}/g, (_, key) => data[key.trim()] || '');
};

app.post('/generate', (req, res) => {
  const data = req.body;

  const templatePath = path.join(__dirname, 'templates', 'deedTemplate.html');
  let template = fs.readFileSync(templatePath, 'utf-8');
  const filledHtml = replacePlaceholders(template, data);

  const generatedDir = path.join(__dirname, 'generated');
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir);
  }

  const outputPath = path.join(generatedDir, 'output.pdf');

  const options = { format: 'A4' };

  pdf.create(filledHtml, options).toFile(outputPath, (err, result) => {
    if (err) {
      console.error('PDF generation failed:', err);
      return res.status(500).send('Error generating PDF');
    }
    res.download(result.filename, 'SaleDeed.pdf');
  });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
