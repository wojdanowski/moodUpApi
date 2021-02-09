import express from 'express';
import * as authController from './../controllers/authController';

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router
  .route('/apiKey')
  .post(authController.isAuthenticated, authController.createApiKey)
  .delete(authController.isAuthenticated, authController.removeApiKey);

export default router;
