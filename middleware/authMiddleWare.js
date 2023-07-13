import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/users.js';
export const protect = asyncHandler(async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		try {
			token = req.headers.authorization.split(' ')[1];
			const decode = jwt.verify(token, process.env.JSONWT_SECRET);
			req.user = await User.findById(decode.id).select('-password');
			next();
		} catch (error) {
			res
				.status(401)
				.json({ success: false, message: error.message });
		}
	}
	if (!token) {
		res.status(401);
		throw new Error('Not Authorized,no token');
	}
});
