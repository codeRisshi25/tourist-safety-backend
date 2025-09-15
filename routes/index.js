import express from 'express';
import exampleController from '../controllers/exampleController.js';

const router = express.Router();

router.get('/example', exampleController.getExample);

export default router;
