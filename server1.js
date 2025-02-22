const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 5000;



app.use(cors());
app.use(fileUpload());
app.use(express.static('public'));

// Upload endpoint
app.post("/upload", (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ msg: "No file was uploaded" });
  }

  const file = req.files.file;

  // Ensure the uploads directory exists'
  const uploadPath = path.join(__dirname, 'public', 'uploads', file.name);

  file.mv(uploadPath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }

    res.json({ fileName: file.name, filePath: `/uploads/${file.name}` });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});