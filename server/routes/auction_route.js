import express from "express";
import { isLoggedIn } from "../middleware/isloggedIn.js";
import { upload } from "../middleware/cloudinaryUpload.js";
import {
  createAuction,
  getAllAuctions,
  getSingleAuction,
  getBidHistory,
  quitAuction,
  deleteAuction,
  getUserAuctions,
  placeBid,
  endAuctionManually,
  unlockPrivateRoom
} from "../controllers/auctionController.js";

// Export a function that accepts io instance
export default function(io) {
  const router = express.Router();

  // CREATE AUCTION
  router.post("/auction/create", isLoggedIn, upload.single("image"), createAuction);

  // GET ALL AUCTIONS
  router.get("/auctions", getAllAuctions);

  // GET SINGLE AUCTION WITH BID HISTORY
  router.get("/auction/:roomId", getSingleAuction);

  // GET BID HISTORY FOR AUCTION
  router.get("/auction/:roomId/bids", getBidHistory);

  // UNLOCK PRIVATE ROOM
  router.post("/auction/:roomId/unlock", isLoggedIn, unlockPrivateRoom);

  // QUIT AUCTION (User leaves auction permanently)
  router.post("/auction/:roomId/quit", isLoggedIn, (req, res) => quitAuction(req, res, io));

  // DELETE AUCTION
  router.delete("/auction/:roomId", isLoggedIn, (req, res) => deleteAuction(req, res, io));

  // GET USER'S AUCTIONS
  router.get("/user/auctions", isLoggedIn, getUserAuctions);

  // PLACE BID (HTTP)
  router.post("/auction/:roomId/bid", isLoggedIn, (req, res) => placeBid(req, res, io));

  // END AUCTION MANUALLY (Admin/Creator)
  router.post("/auction/:roomId/end", isLoggedIn, (req, res) => endAuctionManually(req, res, io));

  return router;
}
