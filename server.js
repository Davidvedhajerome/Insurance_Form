const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const fileUpload = require("express-fileupload");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({ origin: '*' })); // Allow all origins (for ngrok)
app.use(bodyParser.json());
app.use(fileUpload());
app.use(express.static('public'));

mongoose.set('strictQuery', true);

// MongoDB Connection
mongoose.connect('mongodb+srv://davidvedhaj:Jesus007@cluster0.t2khdwv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0\n', {})
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB connection error:', err));

// MongoDB Schema and Model
const familySchema = new mongoose.Schema({
  head: Object,
  spouse: Object,
  sons: Array,
  daughters: Array,
  father: Object,
  mother: Object,
  fatherInLaw: Object,
  motherInLaw: Object,
  address: String,
});

const Family = mongoose.model('Family', familySchema);

// Upload endpoint
app.post("/upload", (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ msg: "No file was uploaded" });
  }

  const file = req.files.file;
  const uploadDir = path.join(__dirname, 'public', 'uploads');

  // Ensure the upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const uploadPath = path.join(uploadDir, file.name);

  file.mv(uploadPath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }

    // Use ngrok public URL for file access

    res.json({ fileName: file.name, filePath: `https://insurance-form.onrender.com/uploads/${file.name}` });
  });
});

// Submit Form Endpoint
app.post('/submit-form', async (req, res) => {
  const familyData = req.body;
  const existingFamily = await Family.findOne({ "head.name": familyData.head.name });

  if (existingFamily) {
    return res.status(400).json({
      message: `Family with the head name '${familyData.head.name}' already exists.`,
    });
  }

  const newFamily = new Family(familyData);

  newFamily.save()
    .then(() => {
      const wb = xlsx.utils.book_new();
      const ws_data = [['Relation', 'Name', 'DOB', 'Phone', 'Address']];
      ws_data.push(['Head of Family', familyData.head.name, familyData.head.dob, familyData.head.phone, familyData.address]);

      if (familyData.spouse) ws_data.push(['Spouse', familyData.spouse.name, familyData.spouse.dob, familyData.spouse.phone, familyData.address]);
      if (familyData.sons) familyData.sons.forEach((son, index) => ws_data.push([`Son ${index + 1}`, son.name, son.dob, son.phone, familyData.address]));
      if (familyData.daughters) familyData.daughters.forEach((daughter, index) => ws_data.push([`Daughter ${index + 1}`, daughter.name, daughter.dob, daughter.phone, familyData.address]));
      if (familyData.father) ws_data.push(['Father', familyData.father.name, familyData.father.dob, familyData.father.phone, familyData.address]);
      if (familyData.mother) ws_data.push(['Mother', familyData.mother.name, familyData.mother.dob, familyData.mother.phone, familyData.address]);
      if (familyData.fatherInLaw) ws_data.push(['Father-in-Law', familyData.fatherInLaw.name, familyData.fatherInLaw.dob, familyData.fatherInLaw.phone, familyData.address]);
      if (familyData.motherInLaw) ws_data.push(['Mother-in-Law', familyData.motherInLaw.name, familyData.motherInLaw.dob, familyData.motherInLaw.phone, familyData.address]);

      const ws = xlsx.utils.aoa_to_sheet(ws_data);
      xlsx.utils.book_append_sheet(wb, ws, familyData.head.name);

      const outputDir = `./output/${familyData.head.name}`;
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

      const filePath = `${outputDir}/${familyData.head.name}.xlsx`;
      xlsx.writeFile(wb, filePath);

      res.status(200).json({
        message: 'Family data submitted, Excel file saved successfully!',
        excelFilePath: filePath,
      });
    })
    .catch((err) => {
      console.error('Error saving family data:', err);
      res.status(500).json({ message: 'Failed to submit form' });
    });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
