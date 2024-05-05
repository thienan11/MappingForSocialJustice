require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const aws = require('aws-sdk');
const mime = require('mime-types');
const app = express();
const cors = require('cors');

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload({
    createParentPath: true
}));

// AWS S3 setup
const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    endpoint: process.env.AWS_ENDPOINT
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Schema
const MediaSchema = new mongoose.Schema({
    title: String,
    description: String,
    url: String,
    lat: Number,
    lng: Number
});

const Media = mongoose.model('Media', MediaSchema);

// Routes
app.post('/upload', async (req, res) => {
    try {
        // console.log(req.files);
        const { files, body: { title, description, lat, lng } } = req;
        if (!files || !files.media) {
            return res.status(400).send('No file uploaded');
        }

        const contentType = mime.lookup(files.media.name) || 'application/octet-stream';  // Default to a binary stream if unknown

        const result = await s3.upload({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: files.media.name,
            Body: files.media.data,
            ACL: 'public-read',
            ContentType: contentType,  // Set the MIME type dynamically
            ContentDisposition: 'inline'
        }).promise();

        const newMedia = new Media({
            title,
            description,
            url: result.Location,
            lat,
            lng
        });

        await newMedia.save();
        res.send({ message: 'File uploaded successfully', media: newMedia });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.toString());
    }
});

app.get('/media', async (req, res) => {
    try {
        const media = await Media.find({});
        res.send(media);
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

app.get("/", (req, res) => {
    res.send("Welcome to the server!");
});
  
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;