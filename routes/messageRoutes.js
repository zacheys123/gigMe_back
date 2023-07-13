import express from 'express';
import {
	sendMessage,
	allMessages,
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleWare.js';
const router = express.Router();
router.route('/message').post(protect, sendMessage);
router.route('/message/:chatId').get(protect, allMessages);

export default router;
