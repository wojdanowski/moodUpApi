import { Document, DocumentQuery } from 'mongoose';

export interface IQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
}

export default class APIFeatures<T extends Document> {
  public query: DocumentQuery<T[], T>;
  private options: IQueryOptions;

  public constructor(query: DocumentQuery<T[], T>, options: IQueryOptions) {
    this.query = query;
    this.options = options;
  }

  public paginate(): this {
    const page = this.options.page ? this.options.page * 1 : 1;
    const limit = this.options.limit ? this.options.limit * 1 : 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  public search(): this {
    if (this.options.search) {
      const phrase = this.options.search;
      this.query = (<DocumentQuery<Document[], Document>>this.query).find({
        name: new RegExp(phrase, 'i'),
      }) as DocumentQuery<T[], T>;
    }

    return this;
  }
}
