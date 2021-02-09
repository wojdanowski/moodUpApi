import express from 'express';
import { getApiDocumentation } from './../controllers/docsController';

const router = express.Router();

router.get('/', getApiDocumentation);

export default router;
