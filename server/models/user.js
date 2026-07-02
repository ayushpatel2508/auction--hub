import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // From socket events: username (used in all socket communications)
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    // For authentication
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    // Watchlist (Array of auction references)
    watchlist: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction"
    }],
  },
  {
    timestamps: true,
  }
);



export const User = mongoose.model("User", userSchema);
