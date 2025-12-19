import Event from "../models/Event.js";

export const getEvents = async (req, res) => {
  try {
    console.log("im herre")
    const { 
      featured, 
      status = "published", 
      limit = 10, 
      skip = 0,
      eventType,
      city,
      country
    } = req.query;

    const query = {};

    if (featured !== undefined) {
      query.featured = featured === "true";
    }

    if (status) {
      query.status = status;
    }

    if (eventType) {
      query.eventType = eventType;
    }

    if (city) {
      query["location.city"] = city;
    }

    if (country) {
      query["location.country"] = country;
    }

    const events = await Event.find(query)
      .sort({ date: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      events,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching events"
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching event"
    });
  }
};

export const getFeaturedEvents = async (req, res) => {
  try {
    const events = await Event.find({
      featured: true,
      status: "published"
    })
      .sort({ date: -1 })
      .limit(3)
      .lean();

    res.json({
      success: true,
      events
    });
  } catch (error) {
    console.error("Error fetching featured events:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching featured events"
    });
  }
};

export const getPortfolioEvents = async (req, res) => {
  try {
    const events = await Event.find({
      status: "published"
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    res.json({
      success: true,
      events
    });
  } catch (error) {
    console.error("Error fetching portfolio events:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching portfolio events"
    });
  }
};
