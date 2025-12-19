import express from "express";
import {
  getEvents,
  getEventById,
  getFeaturedEvents,
  getPortfolioEvents
} from "../controllers/UserController.js";

const router = express.Router();

router.get("/events", getEvents);
router.get("/events/featured", getFeaturedEvents);
router.get("/events/portfolio", getPortfolioEvents);
router.get("/events/:id", getEventById);

export default router;
