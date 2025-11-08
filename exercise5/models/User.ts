import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  name: String,
  age: Number,
});

export const User = models.User || model("User", UserSchema);
