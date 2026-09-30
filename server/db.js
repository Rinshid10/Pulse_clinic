import { MongoClient } from 'mongodb'
import 'dotenv/config'

export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017'
export const DB_NAME = process.env.DB_NAME || 'pulse_clinic'

let client
let db
let connecting

/* Shared by concurrent callers, so a serverless cold start opens one client. */
export function connect() {
  if (db) return Promise.resolve(db)
  connecting ||= (async () => {
    client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    await client.connect()
    db = client.db(DB_NAME)
    return db
  })().finally(() => { connecting = null })
  return connecting
}

export const getDb = () => {
  if (!db) throw new Error('Database not connected yet')
  return db
}

export async function close() {
  await client?.close()
  db = null
}
