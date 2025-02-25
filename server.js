require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = 10000;
const HOSTNAME = '0.0.0.0';

// 🌍 Middleware
app.use(cors({ origin: '*' })); // Allow all origins (for ngrok)
app.use(bodyParser.json());
app.use(fileUpload());
app.use(express.static('public'));
app.use('/output', express.static(path.join(__dirname, 'output')));

// 🌥️ Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

mongoose.set('strictQuery', true);

// 🔗 MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// 📄 MongoDB Schema and Model
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
  cloudinaryExcelUrl: String, // 📌 Added field for Excel URL
});

const Family = mongoose.model('Family', familySchema);

// 📤 Image Upload Endpoint
app.post("/upload", async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ msg: "No file was uploaded" });
  }

  const file = req.files.file; // Uploaded file

  try {
    // Convert file data to base64
    const uploadStr = `data:${file.mimetype};base64,${file.data.toString("base64")}/${file.name}`;

    const result = await cloudinary.uploader.upload(uploadStr, {
      folder: "uploads", // Cloudinary folder
      resource_type: "auto"
    });
    res.json({
      message: '✅ Image uploaded successfully!',
      fileName: file.name,
      cloudinaryUrl: result.secure_url
    });
  } catch (error) {
    console.error('❌ Cloudinary Upload Error:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

// 📥 Submit Form Endpoint
app.post('/submit-form', async (req, res) => {
  try {
    const familyData = req.body;

    // 🛑 Check if Family already exists
    const existingFamily = await Family.findOne({ 'head.name': familyData.head.name });
    if (existingFamily) {
      return res.status(400).json({ message: `Family with head name '${familyData.head.name}' already exists.` });
    }

    // 📝 Save to MongoDB
    const newFamily = new Family(familyData);
    await newFamily.save();

    // 📊 Create Excel File
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

    // 📁 Save Excel Locally
    const tempDir = './temp';
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const filePath = path.join(tempDir, `${familyData.head.name}.xlsx`);
    xlsx.writeFile(wb, filePath);

    // ☁️ Upload Excel to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `${familyData.head.name}`,
      resource_type: 'raw'
    });

    // 🗑️ Delete Local Excel File
    fs.unlinkSync(filePath);

    // 🔄 Update MongoDB with Cloudinary Excel URL
    newFamily.cloudinaryExcelUrl = result.secure_url;
    await newFamily.save();

    res.status(200).json({
      message: '✅ Family data submitted, Excel file uploaded!',
      cloudinaryUrl: result.secure_url,
    });

  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ message: 'Failed to submit form' });
  }
});

// 🚀 Start Server
app.listen(PORT, HOSTNAME, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
