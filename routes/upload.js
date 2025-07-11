const express = require('express');
const multer = require('multer');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const updateFirebase = require('../utils/updateFirebase');

const upload = multer({ dest: 'uploads/' });  // Temporary file storage

module.exports = () => {
  const router = express.Router();

  // Handle firmware upload and notify ESP32 clients
  router.post('/upload', upload.single('firmware'), async (req, res) => {
    console.log('Received firmware upload request');
    console.log('Firmware file:', req.file);
    console.log('Firmware version:', req.body.version);

    try {
      var version = req.body.version;
      // make this version in lowercase
      if (version) {
        version = req.body.version.toLowerCase();
      }
      // console.log('Processed firmware version:', req.body.version);
      // console.log('Processed firmware version (lowercase):', version);

      if (!version || !req.file) {
        return res.status(400).json({
          success: false,
          message: 'Firmware file and version are required.',
        });
      }

      const filePath = req.file.path;

      // Upload to Cloudinary and update Firebase
      const cloudinaryUrl = await uploadToCloudinary(filePath);
      console.log('Cloudinary URL:', cloudinaryUrl);
      await updateFirebase(version, cloudinaryUrl);

      res.status(200).json({
        success: true,
        message: 'Firmware uploaded and Firebase updated successfully.',
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
};
