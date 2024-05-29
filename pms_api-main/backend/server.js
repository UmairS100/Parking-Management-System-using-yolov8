// backend/server.js

const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Multer configuration for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    fs.readFile('/home/hrishi/Downloads/maj-app/frontend/index.html', 'utf8', (err, data) => {
      if (err) {
        // console.error(err);
        res.status(500).send('Error reading file');
        return;
      }
      res.send(data);
    });
  });

// Endpoint for image upload
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // Create form data and append image
    const formData = new FormData();
    formData.append('image', req.file.buffer, { filename: req.file.originalname });
    // Make a POST request to your API
    const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
      headers: {
        ...formData.getHeaders()
      }
    }); 
    console.log(res);
    // res.json(response.data);
    // if (response.data.error) {
    //   // If the API returned an error, send the error message to the frontend
    //   res.status(response.status).json({ error: response.error });
    // } else {
    //   // If there was no error, send the response data to the frontend
    //   res.json(response.data);
    // }
  }catch (error) {
    // console.error(error);
    // If an error occurred during the request to the API, send a generic error message to the frontend
    res.status(500).json({ error: express.response.data.error });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
