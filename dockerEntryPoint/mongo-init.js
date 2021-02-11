db = db.getSiblingDB('recipe_app');
db.createUser({
  user: 'server',
  pwd: 'api1234',
  roles: [{ role: 'readWrite', db: 'recipe_app' }],
});
