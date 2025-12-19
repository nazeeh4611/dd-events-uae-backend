import Client from '../Models/Client.js';
import { validationResult } from 'express-validator';

export const getAllClients = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      eventType,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (eventType && eventType !== 'all') {
      query.eventType = eventType;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const clients = await Client.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Client.countDocuments(query);

    res.status(200).json({
      success: true,
      count: clients.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: clients
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const createClient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const clientData = req.body;

    const existingClient = await Client.findOne({ email: clientData.email });
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'Client with this email already exists'
      });
    }

    const client = await Client.create(clientData);

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: client
    });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating client',
      error: error.message
    });
  }
};

export const updateClient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const clientData = req.body;

    let client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    if (clientData.email && clientData.email !== client.email) {
      const existingClient = await Client.findOne({ email: clientData.email });
      if (existingClient && existingClient._id.toString() !== id) {
        return res.status(400).json({
          success: false,
          message: 'Another client with this email already exists'
        });
      }
    }

    client = await Client.findByIdAndUpdate(
      id,
      { ...clientData, lastContacted: Date.now() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      data: client
    });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating client',
      error: error.message
    });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    await client.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting client',
      error: error.message
    });
  }
};

export const getClientStats = async (req, res) => {
  try {
    const total = await Client.countDocuments();
    const active = await Client.countDocuments({ status: 'active' });
    const leads = await Client.countDocuments({ status: 'lead' });
    const featured = await Client.countDocuments({ isFeatured: true });

    const byStatus = await Client.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const byEventType = await Client.aggregate([
      { $group: { _id: "$eventType", count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        active,
        leads,
        featured,
        byStatus,
        byEventType
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

export const bulkUpdateStatus = async (req, res) => {
  try {
    const { clientIds, status } = req.body;

    if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide client IDs'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status'
      });
    }

    const result = await Client.updateMany(
      { _id: { $in: clientIds } },
      { $set: { status } }
    );

    res.status(200).json({
      success: true,
      message: `Updated ${result.modifiedCount} clients`,
      data: result
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating clients',
      error: error.message
    });
  }
};

export const exportClients = async (req, res) => {
  try {
    const clients = await Client.find({}).lean();

    const headers = ['Name', 'Email', 'Phone', 'Company', 'Status', 'Event Type', 'Source', 'Created At'];
    const csvData = clients.map(client => [
      client.name,
      client.email,
      client.phone,
      client.company || '',
      client.status,
      client.eventType,
      client.source,
      new Date(client.createdAt).toLocaleDateString()
    ]);

    const csv = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=clients.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting clients',
      error: error.message
    });
  }
};