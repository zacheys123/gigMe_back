import expressAsyncHandler from 'express-async-handler';
import Message from '../models/message.js';
import Chat from '../models/chat.js';
import User from '../models/users.js';
import Messages from '../../client/src/components/chatpage/Messages.js';
export const sendMessage = expressAsyncHandler(async (req, res) => {
	const { content, chatId } = req.body;
	if (!content || !chatId) {
		console.log('Invalid data passed');
		return res.status(400);
	}

	let newMessage = {
		sender: req.user._id,
		content,
		chat: chatId,
	};

	try {
		let message = await Message.create(newMessage);

		message = await message.populate('sender', 'name pic');
		message = await message.populate('chat');
		message = await User.populate(message, {
			path: 'chat.user',
			select: 'name email',
		});

		await Chat.findByIdAndUpdate(req.body.chatId, {
			latestMessage: message,
		});
		console.log(message);
		res.json(message);
	} catch (error) {
		res.status(400);
		console.log(error.message);
	}
});
export const allMessages = expressAsyncHandler(async (req, res) => {
	try {
		const messages = await Message.find({
			chat: req.params.chatId,
		})
			.populate('sender', 'name pic email')
			.populate('chat');
		res.json(messages);
	} catch (error) {
		res.status(400).json({ success: false, message: error.message });
		console.log(error.message);
	}
});
