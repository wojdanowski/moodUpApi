const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const mongoFakeServer = new MongoMemoryServer();

const connect = async () => {
	const uri = await mongoFakeServer.getUri();
	const mongooseOpts = {
		useNewUrlParser: true,
		useFindAndModify: false,
		useUnifiedTopology: true,
	};
	await mongoose.connect(uri, mongooseOpts);
};

module.exports = {
	connect,
	mongoFakeServer,
};
