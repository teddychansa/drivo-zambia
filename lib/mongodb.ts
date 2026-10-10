import 'server-only'
import { MongoClient, type Db } from 'mongodb'

const DB_NAME = 'drivo_prod'

const globalForMongo = globalThis as unknown as {
  _drivoMongoClient?: Promise<MongoClient>
}

function getClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it in the Vars section of project settings.')
  }
  if (!globalForMongo._drivoMongoClient) {
    globalForMongo._drivoMongoClient = new MongoClient(uri, {
      appName: 'drivo-web',
      maxPoolSize: 10,
    })
      .connect()
      .catch((error) => {
        globalForMongo._drivoMongoClient = undefined
        throw error
      })
  }
  return globalForMongo._drivoMongoClient
}

export async function getDb(): Promise<Db> {
  const client = await getClient()
  return client.db(DB_NAME)
}
