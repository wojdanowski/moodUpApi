import passport, { Strategy } from 'passport';

const usePassportStrategies = (strategies: Array<Strategy>) => {
	strategies.forEach((strategy: Strategy) => {
		passport.use(strategy);
	});
};

export { usePassportStrategies };
