const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Startup = require('../models/Startup');
const { protect, investorOnly } = require('../middleware/auth');

// @route   GET /api/investors
// @desc    Get all investors (public listing)
router.get('/', protect, async (req, res) => {
  try {
    const investors = await User.find({ role: 'investor' })
      .select('-password -notifications')
      .sort({ createdAt: -1 });
    res.json(investors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching investors' });
  }
});

// @route   GET /api/investors/dashboard
// @desc    Get investor dashboard data
router.get('/dashboard', protect, investorOnly, async (req, res) => {
  try {
    const Connection = require('../models/Connection');

    // Get startups this investor has shown interest in
    const interestedStartups = await Startup.find({
      'interestedInvestors.investor': req.user._id
    }).populate('founder', 'name email avatar department university');

    // Get connections
    const connections = await Connection.find({ investor: req.user._id })
      .populate('startup', 'name tagline category engagementScore logo')
      .populate('founder', 'name email avatar')
      .sort({ updatedAt: -1 });

    // Get bookmarked startups
    const bookmarkedStartups = await Startup.find({
      bookmarks: req.user._id
    }).populate('founder', 'name avatar');

    // Stats
    const stats = {
      totalInterested: interestedStartups.length,
      activeConnections: connections.filter(c => c.status === 'accepted').length,
      pendingConnections: connections.filter(c => c.status === 'pending').length,
      bookmarks: bookmarkedStartups.length
    };

    res.json({ stats, interestedStartups, connections, bookmarkedStartups });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard', error: error.message });
  }
});

// @route   GET /api/investors/:id
// @desc    Get investor profile
router.get('/:id', protect, async (req, res) => {
  try {
    const investor = await User.findOne({ _id: req.params.id, role: 'investor' })
      .select('-password -notifications');
    if (!investor) return res.status(404).json({ message: 'Investor not found' });
    res.json(investor);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching investor' });
  }
});

module.exports = router;