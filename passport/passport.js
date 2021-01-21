const passport = require('passport');

function usePassportStrategies(strategies) {
	strategies.forEach((strategy) => {
		passport.use(strategy.name, strategy.strategy);
	});
}

module.exports = {
	usePassportStrategies,
};
