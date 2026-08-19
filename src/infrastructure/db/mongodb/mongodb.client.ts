import { MongoClient } from 'mongodb';
import { databaseConfig } from '../../../config/database.config.ts';

const mongoClient = new MongoClient(databaseConfig.mongoUrl);

export const mongoDB = mongoClient.db(databaseConfig.mongoDatabase);

export async function connectMongoDB() {
  await mongoClient.connect();
  console.log('Connected to MongoDB');
}
