import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGO_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGO_URI environment variable inside .env.local')
}

// Global mongoose cache across serverless warm invocations and Next.js hot reloads
let cached = global.mongoose
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDb() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }

    // Store the Promise immediately without 'await' to ensure concurrent deduplication
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null // Reset so subsequent requests can retry
    throw e
  }

  return cached.conn
}

export default connectDb
