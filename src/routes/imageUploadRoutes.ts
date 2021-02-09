import express from 'express';
import * as authController from './../controllers/authController';
import { uploadImage } from './../controllers/uploadController';

const router = express.Router();

router.use(authController.isAuthenticated);

router.route('/upload-image').post(authController.restrictTo('admin', 'user'), uploadImage);

export default router;
