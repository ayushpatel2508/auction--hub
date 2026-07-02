import { Auction } from "../models/auction.js";
import { User } from "../models/user.js";
import { Bid } from "../models/bid.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { uploadToCloudinary, deleteFromCloudinary } from "../middleware/cloudinaryUpload.js";

// CREATE AUCTION
export const createAuction = async (req, res) => {
  try {
    const { title, productName, description, startingPrice, duration, category, isPrivate } = req.body;

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

    // Generate passkey if private
    const passkey = isPrivate === 'true' || isPrivate === true ? crypto.randomBytes(3).toString('hex').toUpperCase() : null;

    // Check if roomId exists (unlikely but safe)
    const exists = await Auction.findOne({ roomId });
    if (exists) {
      return res
        .status(400)
        .json({ msg: `Auction with roomId ${roomId} already exists` });
    }

    let hashedPasskey = null;
    if (passkey) {
      hashedPasskey = await bcrypt.hash(passkey, 10);
    }

    const newAuction = await Auction.create({
      roomId,
      title,
      productName,
      imageUrl,
      cloudinaryPublicId,
      description: description || "",
      category: category || "Other",
      startingPrice: Number(startingPrice),
      currentBid: Number(startingPrice),
      duration: Number(duration),
      endTime: new Date(Date.now() + duration * 60 * 1000),
      createdBy: req.user._id,
      status: "active",
      isPrivate: isPrivate === 'true' || isPrivate === true,
      passkey: hashedPasskey
    });

    const auctionResponse = newAuction.toObject();
    auctionResponse.passkey = passkey; // Return plain passkey to the creator once

    res.status(201).json({
      success: true,
      msg: "Auction created successfully",
      auction: auctionResponse,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Failed to create auction",
      error: err.message,
    });
  }
};

// GET ALL AUCTIONS
export const getAllAuctions = async (req, res) => {
  try {
    // Get all auctions first, omitting passkey for security
    const allAuctions = await Auction.find({})
      .select('-passkey')
      .populate('createdBy', 'username')
      .populate('highestBidder', 'username')
      .sort({ createdAt: -1 });

    // Get query parameters
    const category = req.query.category;
    const status = req.query.status;
    const search = req.query.search;

    // Start with all auctions
    let filteredAuctions = allAuctions;

    // Filter by category if specified
    if (category && category !== 'all') {
      filteredAuctions = filteredAuctions.filter(auction => {
        return auction.category === category;
      });
    }

    // Filter by status if specified
    if (status && status !== 'all') {
      filteredAuctions = filteredAuctions.filter(auction => {
        return auction.status === status;
      });
    }

    // Filter by search if specified
    if (search) {
      filteredAuctions = filteredAuctions.filter(auction => {
        const searchLower = search.toLowerCase();
        const titleMatch = auction.title.toLowerCase().includes(searchLower);
        const productMatch = auction.productName.toLowerCase().includes(searchLower);
        const descMatch = auction.description ? auction.description.toLowerCase().includes(searchLower) : false;
        return titleMatch || productMatch || descMatch;
      });
    }

    // Convert to response format
    const responseAuctions = filteredAuctions.map(auction => {
      return {
        ...auction.toObject(),
        timeRemaining: auction.endTime - Date.now(),
        isActive: auction.status === "active",
      };
    });

    res.json({
      success: true,
      totalAuctions: responseAuctions.length,
      auctions: responseAuctions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error fetching auctions",
      error: err.message,
    });
  }
};

// GET SINGLE AUCTION WITH BID HISTORY
export const getSingleAuction = async (req, res) => {
  try {
    const { roomId } = req.params;

    const auction = await Auction.findOne({ roomId })
      .populate('createdBy', 'username')
      .populate('highestBidder', 'username')
      .populate('joinedUsers', 'username');

    if (!auction) {
      return res.status(404).json({
        success: false,
        msg: "Auction not found",
      });
    }

    // Access Control Check for Private Rooms
    if (auction.isPrivate) {
      const token = req.cookies?.token;
      let username = null;
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          username = decoded.username;
        } catch (e) { }
      }

      const isCreator = auction.createdBy && auction.createdBy.username === username;
      const hasJoined = auction.joinedUsers.some(u => u.username === username);

      if (!isCreator && !hasJoined) {
        return res.status(403).json({
          success: false,
          requirePasskey: true,
          msg: "Private room. Passkey required.",
        });
      }
    }

    // Strip passkey before sending
    auction.passkey = undefined;

    const bids = await Bid.find({ auction: auction._id }).populate('user', 'username').sort({ placedAt: -1 }).limit(50);

    res.json({
      success: true,
      auction: {
        ...auction.toObject(),
        timeRemaining: auction.endTime - Date.now(),
        isActive: auction.status === "active",
        bidHistory: bids,
        onlineUsers: auction.onlineUsers,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error fetching auction",
      error: err.message,
    });
  }
};

// GET BID HISTORY FOR AUCTION
export const getBidHistory = async (req, res) => {
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
    const bids = await Bid.find({ auction: auction._id }).populate('user', 'username').sort({ placedAt: -1 }).limit(50);

    res.json(bids);
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error fetching bid history",
      error: err.message,
    });
  }
};

// QUIT AUCTION (User leaves auction permanently)
export const quitAuction = async (req, res, io) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;
    const username = req.user.username;

    const auction = await Auction.findOne({ roomId });

    if (!auction) {
      return res.status(404).json({
        success: false,
        msg: "Auction not found",
      });
    }

    const isCreator = auction.createdBy.equals(userId);

    // Remove user from joinedUsers
    auction.joinedUsers = auction.joinedUsers.filter(id => !id.equals(userId));

    // BID ROLLBACK PROTOCOL
    // 1. Delete all bids by this user in this room
    await Bid.deleteMany({ auction: auction._id, user: userId });

    // 2. Find the highest remaining bid
    const highestRemainingBid = await Bid.findOne({ auction: auction._id }).sort({ amount: -1 }).populate('user', 'username');

    if (highestRemainingBid) {
      auction.currentBid = highestRemainingBid.amount;
      auction.highestBidder = highestRemainingBid.user._id;
      // Mark it as winning
      await Bid.updateOne({ _id: highestRemainingBid._id }, { isWinning: true });
    } else {
      // No bids left
      auction.currentBid = auction.startingPrice;
      auction.highestBidder = null;
    }

    await auction.save();



    // Send different notifications based on whether user is creator or not
    const notificationMessage = isCreator
      ? `Auction creator ${username} has left the auction.`
      : `${username} has left the auction`;

    // Emit to socket for real-time notification to other users
    io.to(roomId).emit("user-quit-auction", {
      username: username,
      message: notificationMessage,
      showAlert: true,
      joinedUsers: auction.joinedUsers
    });

    // Also emit a bid update if a rollback happened
    io.to(roomId).emit("bid-update", {
      highestBid: auction.currentBid,
      highestBidder: auction.highestBidder,
      roomId: roomId,
      isRollback: true
    });

    res.json({
      success: true,
      msg: "Successfully quit the auction",
      isCreator: isCreator,
      notificationMessage: notificationMessage,
      auction: {
        roomId: auction.roomId,
        title: auction.title,
        joinedUsersCount: auction.joinedUsers.length,
        currentBid: auction.currentBid,
        highestBidder: auction.highestBidder
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error quitting auction",
      error: err.message,
    });
  }
};

// DELETE AUCTION
export const deleteAuction = async (req, res, io) => {
  try {
    const { roomId } = req.params;

    const auction = await Auction.findOne({ roomId }).populate('createdBy', 'username').populate('highestBidder', 'username');

    if (!auction) {
      return res.status(404).json({
        success: false,
        msg: "Auction not found",
      });
    }

    // Check if user is the creator
    if (!auction.createdBy.equals(req.user._id)) {
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
      createdBy: auction.createdBy ? auction.createdBy.username : null,
      highestBid: auction.currentBid,
      highestBidder: auction.highestBidder ? auction.highestBidder.username : null,
      totalBids: await Bid.countDocuments({ auction: auction._id }),
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

    // Delete related data
    await Bid.deleteMany({ auction: auction._id });
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
};

// GET USER'S AUCTIONS
export const getUserAuctions = async (req, res) => {
  try {
    const userId = req.user._id;

    // SINGLE DB CALL: Fetch all auctions where the user is either the creator OR in the joinedUsers array
    const userAuctions = await Auction.find({
      $or: [
        { createdBy: userId },
        { joinedUsers: userId }
      ]
    }).select("-passkey").populate('createdBy', 'username').populate('highestBidder', 'username').sort({ createdAt: -1 });

    // Classify the results in memory
    const createdAuctions = [];
    const joinedAuctions = [];

    userAuctions.forEach(auction => {
      if (auction.createdBy && auction.createdBy._id.equals(userId)) {
        createdAuctions.push(auction);
      } else {
        joinedAuctions.push(auction);
      }
    });

    res.json({
      success: true,
      totalAuctions: userAuctions.length,
      created: createdAuctions,
      joined: joinedAuctions,
      // Keeping 'auctions' for backward compatibility if the frontend relies on it
      auctions: createdAuctions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error fetching user auctions",
      error: err.message,
    });
  }
};

// PLACE BID (HTTP)
export const placeBid = async (req, res, io) => {
  try {
    const { roomId } = req.params;
    const { amount } = req.body;
    const userId = req.user._id;
    const username = req.user.username;

    if (!amount) {
      return res.status(400).json({
        success: false,
        msg: "Bid amount is required",
      });
    }

    // Get current auction state
    const auction = await Auction.findOne({ roomId });

    if (!auction) {
      return res.status(404).json({
        success: false,
        msg: "Auction not found",
      });
    }

    // Access Control Check for Private Rooms
    if (auction.isPrivate) {
      if (!auction.createdBy.equals(userId) && !auction.joinedUsers.some(id => id.equals(userId))) {
        return res.status(403).json({ success: false, msg: "Private room access required" });
      }
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

    // Check if user is the creator
    if (auction.createdBy.equals(userId)) {
      return res.status(400).json({
        success: false,
        msg: "You cannot bid on your own auction",
      });
    }

    // Check if the user is trying to bid consecutively
    if (auction.highestBidder && auction.highestBidder.equals(userId)) {
      return res.status(400).json({
        success: false,
        msg: "You cannot place consecutive bids. Wait for another user to bid first.",
      });
    }

    // ATOMIC UPDATE - Prevents race conditions!
    // Only update if currentBid hasn't changed AND auction hasn't ended
    const updatedAuction = await Auction.findOneAndUpdate(
      {
        roomId: roomId,
        currentBid: auction.currentBid, // ← Only update if this is still the current bid
        status: "active", // ← Ensure auction is still active
        endTime: { $gt: new Date() } // ← Ensure auction hasn't expired yet
      },
      {
        $set: {
          currentBid: amount,
          highestBidder: userId
        }
      },
      {
        new: true, // Return updated document
        runValidators: true
      }
    );

    // If update failed, check why
    if (!updatedAuction) {
      const latestAuction = await Auction.findOne({ roomId });

      // Check if auction ended
      if (latestAuction.status === "ended" || latestAuction.endTime <= new Date()) {
        return res.status(400).json({
          success: false,
          msg: "Auction has ended. Bid not accepted.",
        });
      }

      // Otherwise it's a bid conflict
      return res.status(409).json({
        success: false,
        msg: "Bid conflict - another bid was placed. Please try again with a higher amount.",
        currentBid: latestAuction?.currentBid
      });
    }

    // Mark previous bids as not winning
    await Bid.updateMany({ auction: auction._id }, { isWinning: false });

    // Save bid to DB
    const newBid = await Bid.create({
      user: userId,
      auction: auction._id,
      amount: amount,
      isWinning: true,
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
        roomId: updatedAuction.roomId,
        currentBid: updatedAuction.currentBid,
        highestBidder: updatedAuction.highestBidder
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Failed to place bid",
      error: err.message,
    });
  }
};

// END AUCTION MANUALLY (Admin/Creator)
export const endAuctionManually = async (req, res, io) => {
  try {
    const { roomId } = req.params;

    const auction = await Auction.findOne({ roomId }).populate('createdBy', 'username').populate('highestBidder', 'username');

    if (!auction) {
      return res.status(404).json({
        success: false,
        msg: "Auction not found",
      });
    }

    // Check if user is the creator
    if (!auction.createdBy.equals(req.user._id)) {
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
          auction: auction._id,
          user: auction.highestBidder._id,
          amount: auction.currentBid,
        },
        { isWinning: true }
      );
    }

    const winnerName = auction.winner ? auction.winner.username : null;
    const creatorName = auction.createdBy ? auction.createdBy.username : null;

    // Get final auction stats
    const finalStats = {
      title: auction.title,
      createdBy: creatorName,
      winner: winnerName,
      finalPrice: auction.finalPrice,
      totalBids: await Bid.countDocuments({ auction: auction._id }),
      startingPrice: auction.startingPrice,
      endedAt: new Date(),
      endedBy: "creator"
    };

    // Notify all users in the room that auction ended
    io.to(roomId).emit("auction-ended", {
      roomId: roomId,
      winner: winnerName,
      finalPrice: auction.finalPrice,
      message: "Auction has been ended by the creator",
      finalStats: finalStats,
      showWinner: true
    });



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
};

// UNLOCK PRIVATE ROOM
export const unlockPrivateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { passkey } = req.body;
    const userId = req.user._id;

    const auction = await Auction.findOne({ roomId });
    if (!auction) return res.status(404).json({ success: false, msg: "Auction not found" });

    if (!auction.isPrivate) return res.status(400).json({ success: false, msg: "Not a private room" });

    // Compare passkey case-insensitively using bcrypt
    if (!passkey) {
      return res.status(400).json({ success: false, msg: "Invalid passkey" });
    }
    const isMatch = await bcrypt.compare(passkey.toUpperCase(), auction.passkey);
    if (!isMatch) {
      return res.status(400).json({ success: false, msg: "Invalid passkey" });
    }

    // Add user to joinedUsers
    await Auction.updateOne(
      { roomId },
      { $addToSet: { joinedUsers: userId } }
    );

    res.json({ success: true, msg: "Room unlocked successfully" });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server error unlocking room" });
  }
};
