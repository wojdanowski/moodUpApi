const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Name required'],
		maxlength: 30,
		minlength: 3,
	},
	email: {
		type: String,
		required: [true, 'Email required'],
		unique: [true, 'Email is already in use'],
		lowercase: true,
		validate: [validator.isEmail, 'Email not correct'],
	},
	password: {
		type: String,
		required: [true, 'Password is required'],
		minlength: [8, 'Min length of password is 8 characters'],
		select: false,
	},
	passwordConfirm: {
		type: String,
		required: [true, 'Please confirm your password'],
		validate: {
			// This only works on SAVE!!!
			validator: function (el) {
				// if password match passwordConfirm then true => no error
				return el === this.password;
			},
			message: 'Passwords must match',
		},
	},
	role: {
		type: String,
		enum: ['user', 'admin'],
		default: 'user',
	},
	passwordChangedAt: Date,
	passwordResetToken: String,
	passwordResetExpires: Date,
	active: {
		type: Boolean,
		default: true,
		select: false,
	},
});

const User = mongoose.model('User', userSchema);

module.exports = User;
