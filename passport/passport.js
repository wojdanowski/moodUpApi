const passport = require('passport');

function usePassportStrategy(strategies) {
	[...arguments].forEach((strategy) =>
		passport.use(strategy.name, strategy.strategy)
	);
}

module.exports = {
	usePassportStrategy,
};
