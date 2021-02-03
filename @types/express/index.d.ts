import { UserPublic } from '../../src/models/userModel';

declare module 'express-serve-static-core' {
	interface Request {
		user: UserPublic;
		validData: {
			id?: string;
		};
	}
}
