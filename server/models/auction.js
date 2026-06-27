import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  productName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  cloudinaryPublicId: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  category: {
    type: String,
    required: false,
    default: 'Other',
    enum: [
      'Electronics',
      'Fashion',
      'Home & Garden',
      'Sports',
      'Collectibles',
      'Art',
      'Books',
      'Jewelry',
      'Automotive',
      'Other'
    ]
  },
  startingPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  currentBid: {
    type: Number,
    default: 0,
  },
  // Creator (just username for MVP)
  createdBy: {
    type: String,
    required: true,
  },
  // Highest bidder (just username for MVP)
  highestBidder: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["active", "ended"],
    default: "active",
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
  },
  endTime: {
    type: Date,
    required: true,
  },
  // Online users (just usernames for socket compatibility)
  onlineUsers: [{
    type: String,
  }],
  // Joined users (persistent - users who have ever joined this auction)
  joinedUsers: [{
    type: String,
  }],
  // Winner (just username for MVP)
  winner: {
    type: String,
    default: null,
  },
  finalPrice: {
    type: Number,
    default: 0,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  passkey: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

auctionSchema.index({ createdBy: 1 });
auctionSchema.index({ status: 1, endTime: 1 });
auctionSchema.index({ status: 1, createdAt: -1 });
auctionSchema.index({ category: 1 });

export const Auction = mongoose.model("Auction", auctionSchema);
