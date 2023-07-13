import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
	{
		isGroupChat: false,
		chatName: { type: String, trim: true },
		users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
		latestMessage: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Message',
		},
		groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	},
	{ timestamps: true },
);

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
