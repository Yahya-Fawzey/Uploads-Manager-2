require('dotenv').config();
const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');
const app = express();
const PORT = 3000;

// setting AWS
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

// storage
const storage = multer.memoryStorage();
const upload = multer({ storage });


app.use(express.static('public'));

// uploaded files
app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send('no file has been uploaded');

  const params = {
    Bucket: BUCKET_NAME,
    Key: file.originalname,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.error('S3 Upload Error:', err);
      return res.status(500).send('file upload failed');
    }
    res.status(200).send('file uploaded successfully');
  });
});

// fetching files list
app.get('/files', (req, res) => {
  const params = {
    Bucket: BUCKET_NAME,
  };

  s3.listObjectsV2(params, (err, data) => {
    if (err) {
      console.error('S3 List Error:', err);
      return res.status(500).json([]);
    }

    const files = data.Contents.map(obj => ({
      name: obj.Key,
      url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURIComponent(obj.Key)}`
    }));

    res.json(files);
  });
});

// deleting files
app.delete('/delete/:filename', (req, res) => {
  const fileName = decodeURIComponent(req.params.filename);

  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
  };

  s3.deleteObject(params, (err, data) => {
    if (err) {
      console.error('S3 Delete Error:', err);
      return res.status(500).send('file deletion failed');
    }
    res.status(200).send('file deleted successfully');
  });
});

// running the server
app.listen(PORT, () => {
  console.log(` server is live on http://localhost:${PORT}`);
});
