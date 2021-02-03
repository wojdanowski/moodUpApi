import { Document, DocumentQuery } from 'mongoose';

interface IQueryOptions {
	page?: number;
	limit?: number;
	search?: string;
}

export default class APIFeatures {
	query: DocumentQuery<Document[], Document>;
	queryString: IQueryOptions;

	constructor(
		query: DocumentQuery<Document[], Document>,
		queryString: IQueryOptions
	) {
		this.query = query;
		this.queryString = queryString;
	}

	paginate() {
		const page = this.queryString.page ? this.queryString.page * 1 : 1;
		const limit = this.queryString.limit ? this.queryString.limit * 1 : 100;
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