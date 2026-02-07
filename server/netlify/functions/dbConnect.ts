import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI || '';

declare global {
  // eslint-disable-next-line
  var __mongo: { conn: any; promise: Promise<any> | null };
}

export async function connectToDatabase() {
  if (!MONGO_URI) throw new Error('MONGODB_URI not set');

  if (global.__mongo && global.__mongo.conn) {
    return global.__mongo.conn;
  }

  if (!global.__mongo) {
    global.__mongo = { conn: null, promise: null };
  }

  if (!global.__mongo.promise) {
    const opts = {
      serverApi: {
        version: '1' as const,
        strict: true,
        deprecationErrors: true,
      },
    };
    global.__mongo.promise = mongoose.connect(MONGO_URI, opts).then((m) => m);
  }

  global.__mongo.conn = await global.__mongo.promise;
  return global.__mongo.conn;
}
