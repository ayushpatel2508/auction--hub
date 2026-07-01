import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { rateLimit } from "express-rate-limit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import mongoose from "mongoose";
import dotenv from "dotenv";
import { connect } from "./dbconnect/dbconnect.js";

// Load environment variables
dotenv.config();

// Import models
import { Auction } from "./models/auction.js";
import { Bid } from "./models/bid.js";
import { User } from "./models/user.js";

// Import routes
import authRoutes from "./routes/auth.js";
import auctionRoutes from "./routes/auction_route.js";
import userRoutes from "./routes/user_route.js";

const app = express();

app.set('trust proxy', 1);

app.use(cookieParser());

// CORS Configuration
const allowedOrigins = process.env.CLIENT_URL?.split(",") || ["http://localhost:5173"];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or same-origin)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const server = createServer(app);

// Socket.IO Configuration
const socketAllowedOrigins = process.env.SOCKET_CORS_ORIGIN?.split(",") || [
  "http://localhost:5173",
  "http://localhost:3001",
];

const io = new Server(server, {
  cors: {
    origin: socketAllowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

const dbConnecting = async () => {
  try {
    await connect();

    // Start checking expired auctions only after DB is connected
    startExpiredAuctionsCheck();
  } catch (error) {
    // Exit if DB connection fails - removed process.exit for production
  }
};

// Function to start the expired auctions check interval
const startExpiredAuctionsCheck = () => {
  // Run immediately once
  checkExpiredAuctions();

  // Then run every 30 seconds
  setInterval(checkExpiredAuctions, 30000);
};

dbConnecting();
// Function to check and end expired auctions
const checkExpiredAuctions = async () => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return;
    }

    const now = new Date();
    const expiredAuctions = await Auction.find({
      status: "active",
      endTime: { $lte: now },
    });

    for (const auction of expiredAuctions) {
      // Atomic update - only end if still active and expired
      // This prevents race condition with last-second bids
      const endedAuction = await Auction.findOneAndUpdate(
        {
          roomId: auction.roomId,
          status: "active",
          endTime: { $lte: now }
        },
        {
          $set: {
            status: "ended",
            winner: auction.highestBidder || null,
            finalPrice: auction.currentBid
          }
        },
        { new: true }
      ).populate('highestBidder', 'username').populate('createdBy', 'username');

      // If update failed, auction was already ended or got a last-second bid
      if (!endedAuction) {
        continue;
      }

      // Mark winning bid
      if (endedAuction.highestBidder) {
        await Bid.updateOne(
          {
            auction: endedAuction._id,
            user: endedAuction.highestBidder._id,
            amount: endedAuction.currentBid,
          },
          { isWinning: true }
        );
      }



      const winnerName = endedAuction.highestBidder ? endedAuction.highestBidder.username : null;
      const creatorName = endedAuction.createdBy ? endedAuction.createdBy.username : null;

      // Get final auction stats
      const finalStats = {
        title: endedAuction.title,
        createdBy: creatorName,
        winner: winnerName,
        finalPrice: endedAuction.finalPrice,
        totalBids: await Bid.countDocuments({ auction: endedAuction._id }),
        startingPrice: endedAuction.startingPrice,
        endedAt: new Date(),
        endedBy: "timer",
      };

      // Notify all users in the room that auction ended
      io.to(endedAuction.roomId).emit("auction-ended", {
        roomId: endedAuction.roomId,
        winner: winnerName,
        finalPrice: endedAuction.finalPrice,
        message: "Auction has ended due to time expiry",
        finalStats: finalStats,
        showWinner: true,
      });
    }
  } catch (error) {
    // Error checking expired auctions
  }
};

// Set up routes
app.use("/api/auth", authRoutes);
app.use("/api", auctionRoutes(io)); // Pass io instance to auction routes
app.use("/api", userRoutes);

app.get("/", (req, res) => {
  res.send("Auction Server Running");
});

// 404 Route Handler - Express 5 compatible
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "The requested resource does not exist"
    }
  });
});

io.on("connection", (socket) => {
  // 1. JOIN AUCTION
  socket.on("join-auction", async (data) => {
    try {
      const { roomId, username } = data;

      const user = await User.findOne({ username });
      if (!user) return socket.emit("error", "User not found. Please register first.");

      const auction = await Auction.findOne({ roomId });
      if (!auction) return socket.emit("error", "Auction not found");

      // Check Access for Private Rooms
      if (auction.isPrivate) {
        if (!auction.createdBy.equals(user._id) && !auction.joinedUsers.some(id => id.equals(user._id))) {
          return socket.emit("error", "Private room access required");
        }
      }

      // Join socket room
      socket.join(roomId);

      // Check if this is the FIRST time they join
      if (!auction.joinedUsers.some(id => id.equals(user._id))) {
        await Auction.updateOne(
          { roomId },
          { $addToSet: { joinedUsers: user._id } }
        );
        
        // Notify others
        socket.to(roomId).emit("user-joined-notification", {
          username: username,
          message: `${username} joined the auction`,
        });
      }

      socket.emit("auction-joined", `${username} joined successfully`);

    } catch (err) {
      socket.emit("error", "Failed to join auction");
    }
  });

  // DISCONNECT / LEAVE (No tracking needed)
  socket.on("leave-auction", (data) => {
    if(data && data.roomId) {
      socket.leave(data.roomId);
    }
  });
  
  socket.on("disconnect", () => {
    // No backend state cleanup needed anymore!
  });
});

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
