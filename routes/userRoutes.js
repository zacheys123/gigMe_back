import express from 'express';
import {
	login,
	register,
	getAllUsers,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleWare.js';
const router = express.Router();
router.route('/auth/login').post(login);
router.route('/auth/register').post(register);
router.route('/users').get(protect, getAllUsers);

export default router;
