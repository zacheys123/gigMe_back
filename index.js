import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import morgan from 'morgan';
import chatRoutes from './routes/chatRoutes.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import connectDb from './db.js';
import { Server, Socket } from 'socket.io';
dotenv.config();

const source = process.env.MONGO_URI;
const app = express();

app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, DELETE, PUT',
	);
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With',
	);
	res.setHeader('Access-Control-Allow-Credentials', true);
	next();
});

app.use(morgan('dev'));

app.use(express.json({ limit: '100mb', extended: true }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use('/api', userRoutes);
app.use('/api', chatRoutes);
app.use('/api', messageRoutes);
const PORT = process.env.PORT || 3500;
const serverPort = app.listen(PORT, () =>
	console.log(`Running on port ${PORT}`),
);

const ORIGINS_WEBSITE_A = [
	'https://gigme.vercel.app',
	'http://localhost:3000',
];
const ORIGINS_WEBSITE_B = ['*'];

const io = new Server(serverPort, {
	pingTimeout: 60000,
	origin: [...ORIGINS_WEBSITE_A, ...ORIGINS_WEBSITE_B],
});
mongoose.set('strictQuery', true);
mongoose
	.connect(source)
	.then(() => serverPort)
	.catch((error) => console.log(error.message));

const db = mongoose.connection;

db.on('error', (err) => console.log(err.message));
db.once('open', () => console.log('Mongoose is connected'));

io.on('connection', (socket) => {
	console.log('connected to socket.io');

	// listen to a connection

	socket.on('addNewUser', (userData) => {
		socket.join(userData.result._id);
		socket.emit('connected');
	});

	socket.on('join chat', (room) => {
		socket.join(room);

		console.log('User Joined Room', room);
	});

	socket.on('typing', (room) => socket.in(room).emit('typing'));
	socket.on('stop typing', (room) =>
		socket.in(room).emit('stop typing'),
	);
	socket.on('new message', (newmessage) => {
		let chat = newmessage.chat;
		if (!chat.users) {
			console.log('chat.users not defined');
		}

		chat?.users.forEach((user) => {
			if (user === newmessage.sender[0]._id) return;
			console.log(user);
			socket.in(user).emit('message recieved', newmessage);
		});
	});
	socket.off('addNewUser', () => {
		console.log('USER DISCONNECTED');
		socket.leave(userData.result._id);
	});
});
