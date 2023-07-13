import mongoose from 'mongoose';

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedToplogy: true,
		});
		console.log('MongoDb is Connect ', conn.connection.host);
	} catch (error) {
		console.log(error.messgaes);
		process.exit();
	}
};
export default connectDB;
