import mongoose, { CallbackError } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

export interface IUserTemplate {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string | undefined;
  role: string;
  _id?: any;
  apiKey?: string;
  token?: string;
}

export interface IUser extends mongoose.Document, IUserTemplate {}

export interface IUserModel extends mongoose.Model<IUser> {
  correctPassword(candidatePassword: string, password: string): Promise<boolean>;
}

export type UserPublic = Omit<IUserTemplate, 'password' | 'passwordConfirm'>;

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
  apiKey: {
    type: String,
  },
  token: {
    type: String,
    minlength: 160,
  },
});

userSchema.pre<IUser>('save', async function (this: IUser, next: (err?: CallbackError) => void) {
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //  Delete the password confirm
  this.passwordConfirm = undefined;
  next();
});

// check if the password is correct
userSchema.statics.correctPassword = async function (this: mongoose.Model<IUser>, candidatePassword: string, password: string) {
  return await bcrypt.compare(candidatePassword, password);
};

const User = mongoose.model<IUser, IUserModel>('User', userSchema);

export default User;
