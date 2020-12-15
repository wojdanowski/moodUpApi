const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AppError = require('./../utils/appError');
aws.config.update({
	secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	region: process.env.AWS_REGION,
});

const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
	if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
		cb(null, true);
	} else {
		cb(new AppError('Invalid Mime Type, only JPEG and PNG', 400), false);
	}
};

const upload = multer({
	fileFilter,
	storage: multerS3({
		s3: s3,
		acl: 'public-read',
		bucket: 'moodup',
		// bucket: process.env.AWS_BUCKET_NAME,
		metadata: function (req, file, cb) {
			cb(null, { fieldName: 'testing metadata' });
		},
		key: function (req, file, cb) {
			cb(null, Date.now().toString() + '/' + file.originalname);
		},
	}),
});

module.exports = upload;
