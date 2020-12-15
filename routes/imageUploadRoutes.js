const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');
const uploadController = require('./../controllers/uploadController');

router.use(authController.protect);

router
	.route('/upload-image')
	.post(
		authController.restrictTo('admin', 'user'),
		uploadController.uploadImage
	);

module.exports = router;
