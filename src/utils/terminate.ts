import { Server } from 'http';

interface Function {
	(err: Error, promise: Promise<any>): void;
}

function terminate(
	server: Server,
	options = { coredump: false, timeout: 500 }
) {
	const exit = (err: Error | undefined): void => {
		options.coredump ? process.abort() : process.exit();
	};

	return (code: number, reason: string): Function => (
		err: Error,
		promise: Promise<any>
	): void => {
		if (err && err instanceof Error) {
			console.log(err.message, err.stack);
		}

		server.close(exit);
		setTimeout(exit, options.timeout).unref();
	};
}

export default terminate;
