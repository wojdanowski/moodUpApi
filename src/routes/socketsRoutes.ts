import express from 'express';
import { getSocketTestPage } from '../controllers/socketsController';

const router = express.Router();

router.get('/', getSocketTestPage);

export default router;
