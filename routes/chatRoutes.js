import express from 'express';
import {
	accessChats,
	fetchChats,
	createGroupChat,
	renameGroup,
	removeFromGroup,
	addToGroup,
} from '../controllers/chatsController.js';
import { protect } from '../middleware/authMiddleWare.js';
const router = express.Router();
router.route('/chats').post(protect, accessChats);
router.route('/').get(protect, fetchChats);
router.route('/group').post(protect, createGroupChat);
router.route('/rename').put(protect, renameGroup);
router.route('/groupremove').put(protect, removeFromGroup);
router.route('/groupadd').put(protect, addToGroup);

export default router;
