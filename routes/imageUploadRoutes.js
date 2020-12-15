const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');
const upload = require('./../services/fileUpload');

const singleUpload = upload.single('image');

router.use(authController.protect);

router.post('/upload-image', function (req, res) {
	singleUpload(req, res, function (err) {
		if (!req.file) return res.json({ message: 'fail' });
		return res.json({ imageUrl: req.file.location });
	});
});

module.exports = router;
