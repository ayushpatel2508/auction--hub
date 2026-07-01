import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auction",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  isWinning: {
    type: Boolean,
    default: false,
  },
  placedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for fast queries
bidSchema.index({ auction: 1, placedAt: -1 });  // Bid history by auction (most recent first)
bidSchema.index({ auction: 1, amount: -1 });    // Highest bid for this auction
bidSchema.index({ user: 1, placedAt: -1 }); // User's bid history (most recent first)


export const Bid = mongoose.model("Bid", bidSchema);
