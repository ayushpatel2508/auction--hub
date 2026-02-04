import express from "express";
import { Auction } from "../models/auction.js";
import { User } from "../models/user.js";
import { Bid } from "../models/bid.js";
import { Presence } from "../models/presence.js";
import { isLoggedIn } from "../middleware/isloggedIn.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { upload, uploadToCloudinary, deleteFromCloudinary } from "../middleware/cloudinaryUpload.js";

// Export a function that accepts io instance
export default function(io) {
  const router = express.Router();

// CREATE AUCTION
router.post("/auction/create", isLoggedIn, upload.single("image"), async (req, res) => {
  try {
    const { title, productName, description, startingPrice, duration } = req.body;

    // Validate required fields
    if (!title || !productName || !startingPrice || !duration) {
      return res.status(400).json({
        success: false,
        msg: "Please provide all required fields: title, productName, startingPrice, duration",
      });
    }

    // Handle image upload to Cloudinary
    let imageUrl = null;
    let cloudinaryPublicId = null;
    
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, {
          public_id: `auction_${req.user.username}_${Date.now()}`,
        });
        imageUrl = result.secure_url;
        cloudinaryPublicId = result.public_id;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({
          success: false,
          msg: "Failed to upload image. Please try again.",
        });
      }
    }

    // Generate roomId
    const roomId = `room_${req.user.username}_${Date.now()}`;

    // Check if roomId exists (unlikely but safe)
    const exists = await Auction.findOne({ roomId });
    if (exists) {
      return res
        .status(400)
        .json({ msg: `Auction with roomId ${roomId} already exists` });
    }

    const newAuction = await Auction.create({
      roomId,
      title,
      productName,
      imageUrl,
      cloudinaryPublicId,
      description: description || "",
      startingPrice: Number(startingPrice),
      currentBid: Number(startingPrice),
      duration: Number(duration),
      endTime: new Date(Date.now() + duration * 60 * 1000),
      // Use username for simplified schema
      createdBy: req.user.username,
      status: "active",
    });

    res.status(201).json({
      success: true,
      msg: "Auction created successfully",
      auction: newAuction,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Failed to create auction",
      error: err.message,
    });
  }
});

// GET ALL AUCTIONS
router.get("/auctions", async (req, res) => {
  try {
    // Fetch both active and ended auctions
    const auctions = await Auction.find({ 
      status: { $in: ["active", "ended"] } 
    }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      totalAuctions: auctions.length,
      auctions: auctions.map((auction) => ({
        ...auction.toObject(),
        timeRemaining: auction.endTime - Date.now(),
        isActive: auction.status === "active",
      })),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error fetching auctions",
      error: err.message,
    });
  }
});

// GET SINGLE AUCTION WITH BID HISTORY
router.get("/auction/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;

    const auction = await Auction.findOne({ roomId });

    if (!auction) {
      return res.status(404).json({
        success: false,
        msg: "Auction not found",
      });
    }

    // Get bid history (no populate needed, username is directly in bid)
    const bids = await Bid.find({ roomId }).sort({ placedAt: -1 }).limit(50);

    // Get online users (no populate needed, username is directly in presence)
    const onlineUsers = await Presence.find({
      roomId,
      status: "online",
      leftAt: null,
    });

    res.json({
      success: true,
      auction: {
        ...auction.toObject(),
        timeRemaining: auction.endTime - Date.now(),
        isActive: auction.status === "active",
        bidHistory: bids,
        onlineUsers: onlineUsers.map((p) => p.username),
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error fetching auction",
      error: err.message,
    });
  }
});

// GET BID HISTORY FOR AUCTION
router.get("/auction/:roomId/bids", async (req, res) => {
  try {
    const { roomId } = req.params;

    // Check if auction exists
    const auction = await Auction.findOne({ roomId });
    if (!auction) {
      return res.status(404).json({
        success: false,
        msg: "Auction not found",
      });
    }

    // Get bid history sorted by most recent first
    const bids = await Bid.find({ roomId }).sort({ placedAt: -1 }).limit(50);

    res.json(bids);
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error fetching bid history",
      error: err.message,
    });
  }
});

// QUIT AUCTION (User leaves auction permanently)
router.post("/auction/:roomId/quit", isLoggedIn, async (req, res) => {
  try {
    const { roomId } = req.params;
    const username = req.user.username;

    const auction = await Auction.findOne({ roomId });

    if (!auction) {
      return res.status(404).json({
        success: false,
        msg: "Auction not found",
      });
    }

    const isCreator = auction.createdBy === username;

    // Remove user from both onlineUsers and joinedUsers
    auction.onlineUsers = auction.onlineUsers.filter(user => user !== username);
    auction.joinedUsers = auction.joinedUsers.filter(user => user !== username);
    
    await auction.save();

    // Clean up presence records
    await Presence.updateMany(
      { roomId: roomId, username: username },
      { 
        status: "disconnected", 
        leftAt: new Date() 
      }
    );

    // Send different notifications based on whether user is creator or not
    const notificationMessage = isCreator 
      ? `👑 Auction creator ${username} has left the auction. The auction continues without them.`
      : `${username} has left the auction`;

    // Emit to socket for real-time notification to other users
    // This will be handled by the socket event in the main server file

    res.json({
      success: true,
      msg: "Successfully quit the auction",
      isCreator: isCreator,
      notificationMessage: notificationMessage,
      auction: {
        roomId: auction.roomId,
        title: auction.title,
        onlineUsersCount: auction.onlineUsers.length,
        joinedUsersCount: auction.joinedUsers.length
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error quitting auction",
      error: err.message,
    });
  }
});

// DELETE AUCTION
router.delete("/auction/:roomId", isLoggedIn, async (req, res) => {
  try {
    const { roomId } = req.params;

    const auction = await Auction.findOne({ roomId });

    if (!auction) {
      return res.status(404).json({
        success: false,
        msg: "Auction not found",
      });
    }

    // Check if user is the creator
    if (auction.createdBy !== req.user.username) {
      return res.status(403).json({
        success: false,
        msg: "Only auction creator can delete",
      });
    }

    // Delete image from Cloudinary if it exists
    if (auction.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(auction.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error('Error deleting image from Cloudinary:', cloudinaryError);
        // Continue with auction deletion even if image deletion fails
      }
    }

    // Get final auction stats before deletion
    const finalStats = {
      title: auction.title,
      createdBy: auction.createdBy,
      highestBid: auction.currentBid,
      highestBidder: auction.highestBidder,
      totalBids: await Bid.countDocuments({ roomId }),
      startingPrice: auction.startingPrice,
      deletedAt: new Date()
    };

    // Notify all users in the auction room that auction was deleted
    io.to(roomId).emit("auction-deleted", {
      roomId: roomId,
      message: `Auction "${auction.title}" has been deleted by the creator`,
      finalStats: finalStats,
      redirectTo: "/auctions"
    });

    // Clean up presence records
    await Presence.updateMany(
      { roomId: roomId },
      { 
        status: "disconnected", 
        leftAt: new Date() 
      }
    );

    // Delete related data
    await Bid.deleteMany({ roomId });
    await Presence.deleteMany({ roomId });
    await Auction.deleteOne({ roomId });

    res.json({
      success: true,
      msg: "Auction and related data deleted successfully",
      finalStats: finalStats
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error deleting auction",
      error: err.message,
    });
  }
});

// GET USER'S AUCTIONS
router.get("/user/auctions", isLoggedIn, async (req, res) => {
  try {
    //auction joined by user
    const userAuctions_created = await Auction.find({
      createdBy: req.user.username,
    }).sort({ createdAt: -1 });
    //auction not created by user just joine
    const userAuctions_joined = await Auction.find({
      createdBy: { $ne: req.user.username },
    }).select("title onlineUsers");
    // Option 2: Check manually after fetch
const allAuctionsNotCreated = await Auction.find({
  createdBy: { $ne: req.user.username }
}).select("title onlineUsers");

const userJoinedAuctions = allAuctionsNotCreated.filter(auction =>
  auction.onlineUsers.includes(req.user.username)
);

    res.json({
      success: true,
      totalAuctions: userAuctions_created.length,
      auctions: userAuctions_created,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error fetching user auctions",
      error: err.message,
    });
  }
});
// PLACE BID (HTTP)
router.post("/auction/:roomId/bid", isLoggedIn, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { amount } = req.body;
    const username = req.user.username;

    if (!amount) {
      return res.status(400).json({
        success: false,
        msg: "Bid amount is required",
      });
    }

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    const auction = await Auction.findOne({ roomId });

    if (!auction) {
      return res.status(404).json({
        success: false,
        msg: "Auction not found",
      });
    }

    if (auction.status === "ended") {
      return res.status(400).json({
        success: false,
        msg: "Auction has ended",
      });
    }

    if (amount <= auction.currentBid) {
      return res.status(400).json({
        success: false,
        msg: "Bid must be higher than current bid",
      });
    }

    // Check if the user is trying to bid consecutively
    if (auction.highestBidder === username) {
      return res.status(400).json({
        success: false,
        msg: "You cannot place consecutive bids. Wait for another user to bid first.",
      });
    }

    // Update auction
    auction.currentBid = amount;
    auction.highestBidder = username;
    await auction.save();

    // Mark previous bids as not winning
    await Bid.updateMany({ roomId: roomId }, { isWinning: false });

    // Save bid to DB
    const newBid = await Bid.create({
      username: username,
      roomId: roomId,
      amount: amount,
      isWinning: true,
      socketId: 'http-request', // Mark as HTTP request
    });

    // Broadcast to all users in room via Socket.IO
    const bidUpdateData = {
      username: username,
      roomId: roomId,
      amount: amount,
      isWinning: true,
      placedAt: newBid.placedAt
    };

    // Emit both events for compatibility
    io.to(roomId).emit("bid-placed", bidUpdateData);
    io.to(roomId).emit("bid-update", {
      highestBid: amount,
      highestBidder: username,
      roomId: roomId
    });

    res.json({
      success: true,
      msg: "Bid placed successfully",
      bid: bidUpdateData,
      auction: {
        roomId: auction.roomId,
        currentBid: auction.currentBid,
        highestBidder: auction.highestBidder
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Failed to place bid",
      error: err.message,
    });
  }
});

// END AUCTION MANUALLY (Admin/Creator)
router.post("/auction/:roomId/end", isLoggedIn, async (req, res) => {
  try {
    const { roomId } = req.params;

    const auction = await Auction.findOne({ roomId });

    if (!auction) {
      return res.status(404).json({
        success: false,
        msg: "Auction not found",
      });
    }

    // Check if user is the creator
    if (auction.createdBy !== req.user.username) {
      return res.status(403).json({
        success: false,
        msg: "Only auction creator can end auction",
      });
    }

    if (auction.status === "ended") {
      return res.status(400).json({
        success: false,
        msg: "Auction already ended",
      });
    }

    // End the auction
    auction.status = "ended";
    auction.winner = auction.highestBidder;
    auction.finalPrice = auction.currentBid;

    await auction.save();

    // Mark winning bid
    if (auction.highestBidder) {
      await Bid.updateOne(
        {
          roomId: roomId,
          username: auction.highestBidder,
          amount: auction.currentBid,
        },
        { isWinning: true }
      );
    }

    // Get final auction stats
    const finalStats = {
      title: auction.title,
      createdBy: auction.createdBy,
      winner: auction.winner,
      finalPrice: auction.finalPrice,
      totalBids: await Bid.countDocuments({ roomId }),
      startingPrice: auction.startingPrice,
      endedAt: new Date(),
      endedBy: "creator"
    };

    // Notify all users in the room that auction ended
    io.to(roomId).emit("auction-ended", {
      roomId: roomId,
      winner: auction.winner,
      finalPrice: auction.finalPrice,
      message: "Auction has been ended by the creator",
      finalStats: finalStats,
      showWinner: true
    });

    // Clean up presence (mark all as left)
    await Presence.updateMany(
      { roomId: roomId, leftAt: null },
      {
        status: "disconnected",
        leftAt: new Date(),
      }
    );

    res.json({
      success: true,
      msg: "Auction ended successfully",
      auction: {
        roomId: auction.roomId,
        winner: auction.winner || "No winner",
        finalPrice: auction.finalPrice,
        status: auction.status,
      },
      finalStats: finalStats
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error ending auction",
      error: err.message,
    });
  }
});

  return router;
}
