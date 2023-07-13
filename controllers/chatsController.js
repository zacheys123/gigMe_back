import asyncHandler from 'express-async-handler';
import Chat from '../models/chat.js';
import User from '../models/users.js';
export const accessChats = asyncHandler(async (req, res) => {
	const { userId } = req.body;
	if (!userId) {
		res.status(401).json('UserId param not sent with request');
	}

	let isChat = await Chat.find({
		isGroupChat: false,
		$and: [{ users: { $all: [userId, req.user._id] } }],
	})
		.populate('users', '-password')
		.populate('latestMessage');
	isChat = await User.populate(isChat, {
		path: 'latestMessage.sender',
		select: 'name,email',
	});
	if (isChat.length > 0) {
		res.send(isChat[0]);
	} else {
		try {
			const createChat = await Chat.create({
				chatName: 'sender',
				isGroupChat: false,
				users: [req.user._id, userId],
			});
			const FullChatData = await Chat.findOne({
				_id: createChat._id,
			}).populate('users', '-password');
			res.status(200).json(FullChatData);
		} catch (error) {
			res.status(401).json({ message: error.message });
		}
	}
});
export const fetchChats = asyncHandler(async (req, res) => {
	try {
		const results = Chat.find({ users: { $all: [req.user._id] } })
			.populate('users', '-password')
			.populate('groupAdmin', '-password')
			.populate('latestMessage')
			.sort({ updatedAt: -1 });

		const data = await User.populate(results, {
			path: 'latestMessage.sender',
			select: 'name email',
		});
		res.status(200).send(data);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});
export const createGroupChat = asyncHandler(async (req, res) => {
	if (!req.body.users || !req.body.name) {
		return res
			.status(401)
			.json({ message: 'Please fill all the fields' });
	}
	var users = JSON.parse(req.body.users);

	if (users.length < 2) {
		return res.status(400).send('More than 2 users are required');
	}
	users.push(req.user);
	try {
		const groupchat = await Chat.create({
			chatName: req.body.name,
			users: users,
			isGroupChat: true,
			groupAdmin: req.user,
		});

		const fullGroupChat = await Chat.findOne({ _id: groupchat._id })
			.populate('users', '-password')
			.populate('groupAdmin', '-password');
		res.status(200).json({
			message: 'Successfully created Group',
			result: fullGroupChat,
		});
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

export const renameGroup = asyncHandler(async (req, res) => {
	const { chatId, chatName } = req.body;
	console.log(req.body);
	if (!chatName) {
		res.status(400).json({ message: 'Chat name field is empty' });
	}
	const updateChat = await Chat.findByIdAndUpdate(
		chatId,
		{ chatName },
		{ new: true },
	)
		.populate('users', '-password')
		.populate('groupAdmin', '-password');

	if (!updateChat) {
		res.status(404).json({ message: 'chat not found' });
	} else {
		res.json(updateChat);
	}
});

export const addToGroup = asyncHandler(async (req, res) => {
	const { chatId, userId } = req.body;
	console.log(userId);

	const added = await Chat.findByIdAndUpdate(
		chatId,
		{
			$push: { users: userId },
		},
		{ new: true },
	)
		.populate('users', '-password')
		.populate('groupAdmin', '-password');

	if (!added) {
		res.status(404).json({ message: 'chat not found' });
	} else {
		res.json(added);
	}
});

export const removeFromGroup = asyncHandler(async (req, res) => {
	const { chatId, userId } = req.body;

	const remove = await Chat.findByIdAndUpdate(
		chatId,
		{
			$pull: { users: userId },
		},
		{ new: true },
	)
		.populate('users', '-password')
		.populate('groupAdmin', '-password');

	if (!remove) {
		res.status(404).json({ message: 'chat not found' });
	} else {
		res.json(remove);
	}
});
