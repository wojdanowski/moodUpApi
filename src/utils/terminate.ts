import { RefreshClosedReports } from 'aws-sdk/clients/cur';
import { Server } from 'http';

interface CloseFunction {
	(err: Error, promise: Promise<any>): void;
}

interface CreatorFunction {
	(reason: string): CloseFunction;
}

function terminate(
	server: Server,
	options = { coredump: false, timeout: 500 }
): CreatorFunction {
	const exit = (err: Error | undefined): void => {
		options.coredump ? process.abort() : process.exit();
	};

	return (reason: string): CloseFunction => (
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
