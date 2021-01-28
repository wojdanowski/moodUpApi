function terminate(server: any, options = { coredump: false, timeout: 500 }) {
	const exit = (code: any) => {
		options.coredump ? process.abort() : process.exit(code);
	};

	return (code: any, reason: any) => (err: any, promise: any) => {
		if (err && err instanceof Error) {
			console.log(err.message, err.stack);
		}

		server.close(exit);
		setTimeout(exit, options.timeout).unref();
	};
}

export default terminate;
