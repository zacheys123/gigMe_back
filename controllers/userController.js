import User from '../models/users.js';
import generateToken from '../jwtfunc.js';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../utils/sendEmail.js';
export const register = asyncHandler(async (req, res) => {
	const { name, email, password, confirmpassword, pic } = req.body;
	try {
		if (name && email && password && confirmpassword) {
			if (password === confirmpassword) {
				if (password.length > 7 && confirmpassword.length > 7) {
					const user = await User.findOne({ email });

					if (!user) {
						const newuser = new User({
							name,
							email,
							password,
							pic,
						});
						const savedAdmin = await newuser.save();
						if (savedAdmin) {
							const send_to = email;
							const send_from = process.env.EMAIL;
							const subject = 'Welcome to GameHubz';
							const message = `
		<h2>Hello there ${name}</h2>
		<br />
		<p>Welcome to gigMe,a platform for all musicians to share their knowledge.</p>
		<p>By getting this confirmation email it shows you have registered successfully.</p><span>On the website you're already navigated to the home page,here you get to see wahat your fellow musicians are upto and also access the main part and goal for this website.i.e gigs promotions and updates</span>
<p>We are happy to welcome you to our family,enjoy everything about gamehubz.
You will be sent reminders and notifications of any updates or promotions.</p>
<h5>Regards from:</h5>
<h6>Zacharia Muigai,<span style={{color:'red',fontWeight:'bold',fontSize:'.9rem}}>Head of Technology</span></h6>
		`;
							await sendEmail(subject, send_to, send_from, message);
							console.log('Email Sent');
							res.status(201).json({
								message: 'Successfully Registered',
								result: savedAdmin,
								token: generateToken(savedAdmin._id),
							});
						} else {
							res.status(404).json({
								message: 'Failed to register User',
							});
						}
					} else {
						res.status(404).json({
							message: 'Username/Email exists,choose another',
						});
					}
				} else {
					res.status(403).json({
						message:
							'Both Passwords characters should be more than 7',
					});
				}
			} else {
				res
					.status(403)
					.json({ message: 'Both Passwords Should Match' });
			}
		} else {
			res
				.status(403)
				.json({ message: 'All fields Should be filled' });
		}
	} catch (err) {
		console.log(err.message);
	}
});
export const login = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	if (email && password) {
		const user = await User.findOne({ email });
		if (!user) {
			res.status(404).json({ message: 'User does not Exist' });
		}
		const matchpass = await bcrypt.compare(password, user.password);
		if (matchpass) {
			res.status(200).json({
				message: 'Login Successfull',
				result: user,
				token: generateToken(user._id),
			});
		} else {
			res.status(404).json({ message: 'Wrong password entered' });
		}
	} else {
		res.status(404).json({ message: 'All Fields Should be Entered' });
	}
});

export const getAllUsers = asyncHandler(async (req, res) => {
	try {
		const keyword = req.query.search
			? {
					name: { $regex: req.query.search, $options: 'i' },
			  }
			: {};
		const users = await User.find(keyword).find({
			_id: { $ne: req.user._id },
		});

		res.status(200).json({ result: users });
	} catch (error) {
		res.status(404).json(error.message);
	}
});
