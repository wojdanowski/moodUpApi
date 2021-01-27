const passport = require('passport');

const usePassportStrategies = (strategies: any) => {
	strategies.forEach((strategy: any) => {
		passport.use(strategy.name, strategy.strategy);
	});
};

const another = (strategies: any) => {
	strategies.forEach((strategy: any) => {
		passport.use(strategy.name, strategy.strategy);
	});
};

export { usePassportStrategies, another };
