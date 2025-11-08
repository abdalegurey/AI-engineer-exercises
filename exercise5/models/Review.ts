import { Schema, model, models } from "mongoose";

const ReviewSchema = new Schema({
  movieId: { type: Schema.Types.ObjectId, ref: "Movie" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  rating: Number,
  comment: String,
});

export const Review = models.Review || model("Review", ReviewSchema);
