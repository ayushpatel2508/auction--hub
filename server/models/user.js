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
      minlength: 6,
      select: false,
    },
    // Socket ID for real-time tracking
    socketId: {
      type: String,
      default: null,
    },
    // Online status (updated when user connects/disconnects)
    isOnline: {
      type: Boolean,
      default: false,
    },
    // Current room they're in (if any)
    currentRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
      default: null,
    },
    // Last activity timestamp
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    // Track typing status
    isTyping: {
      type: Boolean,
      default: false,
    },
    // Authentication tokens (for sessions)
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
    // Account verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Rooms they've joined (history)
    joinedRooms: [
      {
        auction: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Auction",
        },
        joinedAt: Date,
        leftAt: Date,
      },
    ],
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
