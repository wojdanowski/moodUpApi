import { chai, app, stubbedIsAuthenticatedApi } from './test_config';
import { StatusCodes } from 'http-status-codes';
import { getUserData, getDummyRecipe, TestUser } from './mockDb';
import { IRecipeTemplate } from '../models/recipeModel';
import { Request, Response, NextFunction } from 'express';

const BASE_URL: string = '/api/v1/recipes';
const RECIPE_ID_NOT_EXISTENT: string = '5fd790724a7ab216c8920315';
const RECIPE_ID_WRONG: string = 'testId';

describe('Recipes', (): void => {
  let dummyUser: TestUser;
  let dummyRecipe: IRecipeTemplate;
  const EXPECTED_RECIPE_COUNT: number = 2;

  before(async function (): Promise<void> {
    dummyUser = await getUserData();
    dummyRecipe = await getDummyRecipe();
  });

  describe('GET /', (): void => {
    beforeEach(function (): void {
      stubbedIsAuthenticatedApi.callsFake((req: Request, res: Response, next: NextFunction): void => {
        req.user = {
          ...dummyUser,
        };
        return next();
      });
    });

    it('should return status code 200', async function (): Promise<void> {
      const response = await chai.request(app).get(BASE_URL);

      response.should.have.status(StatusCodes.OK);
    });

    it('should return all (two) recipes from database', async function (): Promise<void> {
      const response = await chai.request(app).get(BASE_URL);

      chai.assert(response.body.results === EXPECTED_RECIPE_COUNT, 'Returned invalid number of recipes from database');
    });

    it('should get recipe with provided ID and return status code 200  ', async function (): Promise<void> {
      const response = await chai.request(app).get(`${BASE_URL}/${dummyRecipe._id}`);

      response.should.have.status(StatusCodes.OK);
    });

    it('should return status code 404 when there is no recipe with provided ID', async function (): Promise<void> {
      const response = await chai.request(app).get(`${BASE_URL}/${RECIPE_ID_NOT_EXISTENT}`);

      response.should.have.status(StatusCodes.NOT_FOUND);
    });

    it('should return status code 400 when provided with invalid/not-MongoDb ID', async function (): Promise<void> {
      const response = await chai.request(app).get(`${BASE_URL}/${RECIPE_ID_WRONG}`);

      response.should.have.status(StatusCodes.BAD_REQUEST);
    });
  });
});
