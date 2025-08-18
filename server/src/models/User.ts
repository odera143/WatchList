import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  picture: String,
  watchlist: [
    {
      movieId: Number,
      title: String,
      poster_path: String,
      overview: String,
      popularity: Number,
      vote_average: Number,
      release_date: String,
      genre_ids: [Number],
      added_at: { type: Date, default: Date.now },
      times_watched: { type: Number, default: 0 },
    },
  ],
  watched: [
    {
      movieId: Number,
      title: String,
      poster_path: String,
      overview: String,
      popularity: Number,
      vote_average: Number,
      release_date: String,
      genre_ids: [Number],
      times_watched: { type: Number, default: 1 },
      last_watched: { type: Date, default: Date.now },
    },
  ],
});

export const User = mongoose.model('User', userSchema);
