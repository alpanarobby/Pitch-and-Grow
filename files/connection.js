const express = require('express');
const router = express.Router();
const Connection = require('../models/Connection');
const User = require('../models/User');
const Startup = require('../models/Startup');
const { protect, investorOnly, founderOnly } = require('../middleware/auth');

// @route   POST /api/connections
// @desc    Investor sends connection request to founder
router.post('/', protect, investorOnly, async (req, res) => {
  try {
    const { startupId, message } = req.body;

    const startup = await Startup.findById(startupId).populate('founder');
    if (!startup) return res.status(404).json({ message: 'Startup not found' });

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      investor: req.user._id,
      startup: startupId
    });

    if (existingConnection) {
      return res.status(400).json({ message: 'Connection request already sent' });
    }

    const connection = await Connection.create({
      investor: req.user._id,
      founder: startup.founder._id,
      startup: startupId,
      message: message || ''
    });

    // Notify founder
    await User.findByIdAndUpdate(startup.founder._id, {
      $push: {
        notifications: {
          message: `Investor ${req.user.name} wants to connect about "${startup.name}"!`,
          type: 'connection'
        }
      }
    });

    const populated = await Connection.findById(connection._id)
      .populate('investor', 'name firm avatar email')
      .populate('founder', 'name avatar email')
      .populate('startup', 'name tagline category');

    res.status(201).json({ message: 'Connection request sent!', connection: populated });
  } catch (error) {
    res.status(500).json({ message: 'Error creating connection', error: error.message });
  }
});

// @route   GET /api/connections
// @desc    Get all connections for current user
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'investor') query.investor = req.user._id;
    if (req.user.role === 'founder') query.founder = req.user._id;

    const connections = await Connection.find(query)
      .populate('investor', 'name firm avatar email phone linkedIn')
      .populate('founder', 'name avatar email department university')
      .populate('startup', 'name tagline category engagementScore logo stage')
      .sort({ updatedAt: -1 });

    res.json(connections);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching connections' });
  }
});

// @route   PUT /api/connections/:id
// @desc    Accept/decline connection (founder)
router.put('/:id', protect, founderOnly, async (req, res) => {
  try {
    const { status, founderResponse } = req.body;
    const connection = await Connection.findOne({ _id: req.params.id, founder: req.user._id });

    if (!connection) return res.status(404).json({ message: 'Connection not found' });

    connection.status = status;
    if (founderResponse) connection.founderResponse = founderResponse;
    await connection.save();

    // Notify investor
    const statusText = status === 'accepted' ? 'accepted' : 'declined';
    await User.findByIdAndUpdate(connection.investor, {
      $push: {
        notifications: {
          message: `${req.user.name} has ${statusText} your connection request!`,
          type: 'connection'
        }
      }
    });

    res.json({ message: `Connection ${statusText}!`, connection });
  } catch (error) {
    res.status(500).json({ message: 'Error updating connection' });
  }
});

// @route   POST /api/connections/:id/message
// @desc    Send a message in connection chat
router.post('/:id/message', protect, async (req, res) => {
  try {
    const { text } = req.body;
    const connection = await Connection.findOne({
      _id: req.params.id,
      $or: [{ investor: req.user._id }, { founder: req.user._id }],
      status: 'accepted'
    });

    if (!connection) return res.status(404).json({ message: 'Connection not found or not accepted' });

    connection.messages.push({
      sender: req.user._id,
      text
    });

    await connection.save();
    res.json({ message: 'Message sent!', messages: connection.messages });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message' });
  }
});

// @route   GET /api/connections/:id/messages
// @desc    Get chat messages for a connection
router.get('/:id/messages', protect, async (req, res) => {
  try {
    const connection = await Connection.findOne({
      _id: req.params.id,
      $or: [{ investor: req.user._id }, { founder: req.user._id }]
    }).populate('messages.sender', 'name avatar role');

    if (!connection) return res.status(404).json({ message: 'Connection not found' });

    res.json(connection.messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

module.exports = router;