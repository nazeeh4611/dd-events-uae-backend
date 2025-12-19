import Event from '../models/Event.js';

/* ==================== GET ==================== */

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/* ==================== CREATE ==================== */

export const createEvent = async (req, res) => {
    try {
      const images = req.files?.map(file => file.location) || [];
  
      // Create location object from individual fields
      const location = {
        address: req.body.address || '',
        city: req.body.city || '',
        state: req.body.state || '',
        country: req.body.country || ''
      };
  
      const eventData = {
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        clientName: req.body.clientName || '',
        eventType: req.body.eventType || 'wedding',
        status: req.body.status || 'published',
        featured: req.body.featured === 'true' || req.body.featured === true,
        location,
        images: images.length > 0 ? images : ['default-event-image.jpg'] // Add default image if none
      };
  
      const event = await Event.create(eventData);
  
      res.status(201).json({ 
        success: true,
        message: 'Event created successfully',
        data: event 
      });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  };
  
  export const updateEvent = async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }
  
      // Handle existing images
      let images = [];
      if (req.body.existingImages) {
        try {
          images = JSON.parse(req.body.existingImages);
        } catch (e) {
          images = [];
        }
      }
  
      // Add new images
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => file.location);
        images = [...images, ...newImages];
      }
  
      // Create/update location object from individual fields
      const location = {
        address: req.body.address || event.location?.address || '',
        city: req.body.city || event.location?.city || '',
        state: req.body.state || event.location?.state || '',
        country: req.body.country || event.location?.country || ''
      };
  
      // Update event data
      event.title = req.body.title || event.title;
      event.description = req.body.description || event.description;
      event.date = req.body.date || event.date;
      event.clientName = req.body.clientName || event.clientName;
      event.eventType = req.body.eventType || event.eventType;
      event.status = req.body.status || event.status;
      event.featured = req.body.featured === 'true' || req.body.featured === true;
      event.location = location;
      event.images = images.length > 0 ? images : event.images;
  
      await event.save();
  
      res.json({ 
        success: true,
        message: 'Event updated successfully',
        data: event 
      });
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  };

/* ==================== DELETE ==================== */

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({ 
      success: true, 
      message: 'Event deleted successfully' 
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const deleteEventImage = async (req, res) => {
  try {
    const { id, index } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    if (index < 0 || index >= event.images.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image index'
      });
    }

    event.images.splice(index, 1);
    await event.save();

    res.json({ 
      success: true,
      message: 'Image deleted successfully',
      images: event.images 
    });
  } catch (error) {
    console.error('Delete event image error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/* ==================== STATUS & FEATURE ==================== */

export const toggleEventFeatured = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    event.featured = !event.featured;
    await event.save();

    res.json({ 
      success: true,
      message: `Event ${event.featured ? 'featured' : 'unfeatured'} successfully`,
      data: event 
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const updateEventStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({ 
      success: true,
      message: 'Event status updated successfully',
      data: event 
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/* ==================== STATS ==================== */

export const getEventsStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const publishedEvents = await Event.countDocuments({ status: 'published' });
    const draftEvents = await Event.countDocuments({ status: 'draft' });
    const featuredEvents = await Event.countDocuments({ featured: true });

    const eventsByType = await Event.aggregate([
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalEvents,
        publishedEvents,
        draftEvents,
        featuredEvents,
        eventsByType
      }
    });
  } catch (error) {
    console.error('Get events stats error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/* ==================== BULK ==================== */

export const bulkUpdateEvents = async (req, res) => {
  try {
    const { ids, data } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide event IDs'
      });
    }

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide update data'
      });
    }

    const result = await Event.updateMany(
      { _id: { $in: ids } },
      { $set: data }
    );

    res.json({ 
      success: true,
      message: `${result.modifiedCount} events updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};