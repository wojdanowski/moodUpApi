import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
	password: string;
	passwordConfirm?: string;
}

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		maxlength: 30,
		minlength: 3,
	},
	email: {
		type: String,
		required: [true, 'Email required'],
		unique: [true, 'Email is already in use'],
		// lowercase: true,
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
			validator: function (this: IUser, el: any) {
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
	// active: {
	// 	type: Boolean,
	// 	default: true,
	// 	select: false,
	// },
});

// userSchema.obj.passwordConfirm.validate.validator = function (el: any) {
// 	// if password match passwordConfirm then true => no error
// 	return el === this.password;
// };

userSchema.pre('save', async function (this: IUser, next) {
	// Hash the password with cost of 12
	this.password = await bcrypt.hash(this.password, 12);
	//  Delete the password confirm
	this.passwordConfirm = undefined;
	next();
});

// Show only active users.
// userSchema.pre(/^find/, function (this: IUser,next) {
// 	this.constructor.find({ active: { $ne: false } });
// 	next();
// });

// check if the password is correct
userSchema.methods.correctPassword = async function (
	candidatePassword: any,
	userPassword: any
) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

export default User;
