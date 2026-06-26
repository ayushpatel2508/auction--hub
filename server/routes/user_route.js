import express from "express";
import { isLoggedIn } from "../middleware/isloggedIn.js";
import { 
  getProfile, 
  getWatchlist, 
  toggleWatchlist, 
  getMyAuctions, 
  getJoinedAuctions, 
  getMyBids, 
  getWonAuctions, 
  getPublicStats 
} from "../controllers/userController.js";

const router = express.Router();

// ========== USER ROUTES ==========

// GET /api/users/profile - Get user profile
router.get("/profile", isLoggedIn, getProfile);

// GET /api/users/watchlist - Get user's watchlist
router.get("/users/watchlist", isLoggedIn, getWatchlist);

// POST /api/users/watchlist/:roomId - Toggle watchlist item
router.post("/users/watchlist/:roomId", isLoggedIn, toggleWatchlist);

// GET /api/users/my-auctions - Get user's created auctions
router.get("/users/my-auctions", isLoggedIn, getMyAuctions);

// GET /api/users/joined-auctions - Get auctions user has joined (active + past month)
router.get("/users/joined-auctions", isLoggedIn, getJoinedAuctions);

// GET /api/users/my-bids - Get user's bid history (latest 10)
router.get("/users/my-bids", isLoggedIn, getMyBids);

// GET /api/users/won-auctions - Get auctions user won
router.get("/users/won-auctions", isLoggedIn, getWonAuctions);

// GET /api/public/stats - Get public system stats (for home page)
router.get("/public/stats", getPublicStats);

export default router;