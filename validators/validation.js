const { param } = require('express-validator/check');

// const validateCaseId = param('caseId', ValidationError.MustBeMongoId).isMongoId();

exports.validateId = param('id', 'wrong ID').isMongoId();

exports.validateTwo = (req,res,next) => {
    // param('id', 'wrong ID');
    console.log(req.params);
    next();
}