import express from 'express';
import * as authController from './../controllers/authController';

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post(
	'/createApiKey',
	authController.isAuthenticated,
	authController.createApiKey
);

export default router;
