const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

aws.config.update({
	secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	region: process.env.AWS_REGION,
});

const s3 = new aws.S3();

const upload = multer({
	storage: multerS3({
		s3: s3,
		acl: 'public-read',
		bucket: process.env.AWS_BUCKET_NAME,
		metadata: function (req, file, cb) {
			cb(null, { fieldName: 'testing metadata' });
		},
		key: function (req, file, cb) {
			cb(null, Date.now().toString() + '/' + file.originalname);
		},
	}),
});

module.exports = upload;
