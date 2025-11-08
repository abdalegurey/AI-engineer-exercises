import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_chat_db';

if (!MONGODB_URI) {
  throw new Error('⚠️ MONGODB_URI not defined in .env.local');
}

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI);

      const apiKey = process.env.OMDB_API_KEY;
  console.log("apikey",apiKey)
    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
}

// Define schemas
const MovieSchema = new Schema({
  title: String,
  genre: String,
  rating: Number,
});



const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
});

const reviewSchema = new mongoose.Schema({
  movieId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  comment: String,
  rating: Number,
});

export const Movie = mongoose.models.Movie || mongoose.model('Movie', movieSchema);
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
