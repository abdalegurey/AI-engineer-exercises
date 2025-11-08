import { Schema, model, models } from "mongoose";

const MovieSchema = new Schema({
  title: String,
  genre: String,
  rating: Number,
});

export const Movie = models.Movie || model("Movie", MovieSchema);



