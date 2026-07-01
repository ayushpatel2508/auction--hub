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
  // Creator
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Highest bidder
  highestBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
  // Online users
  onlineUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  // Joined users (persistent - users who have ever joined this auction)
  joinedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  // Winner
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
