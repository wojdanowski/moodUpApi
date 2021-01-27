class APIFeatures {
	constructor(query, queryString) {
		this.query = query;
		this.queryString = queryString;
	}

	paginate() {
		const page = this.queryString.page * 1 || 1;
		const limit = this.queryString.limit * 1 || 100;
		const skip = (page - 1) * limit;
		this.query = this.query.skip(skip).limit(limit);

		return this;
	}

	search() {
		if (this.queryString.search) {
			const phrase = this.queryString.search;
			this.query = this.query.find({
				name: new RegExp(phrase, 'i'),
			});
		}

		return this;
	}
}

module.exports = APIFeatures;
