const express = require('express');
const router = express.Router();
const Startup = require('../models/Startup');
const User = require('../models/User');
const Connection = require('../models/Connection');
const { protect, founderOnly } = require('../middleware/auth');

// @route   GET /api/analytics/founder
// @desc    Get founder dashboard analytics
router.get('/founder', protect, founderOnly, async (req, res) => {
  try {
    const startups = await Startup.find({ founder: req.user._id });

    const totalViews = startups.reduce((sum, s) => sum + s.views, 0);
    const totalLikes = startups.reduce((sum, s) => sum + s.likes.length, 0);
    const totalBookmarks = startups.reduce((sum, s) => sum + s.bookmarks.length, 0);
    const totalInterested = startups.reduce((sum, s) => sum + s.interestedInvestors.length, 0);
    const avgScore = startups.length > 0
      ? Math.round(startups.reduce((sum, s) => sum + s.engagementScore, 0) / startups.length)
      : 0;

    const connections = await Connection.find({ founder: req.user._id });
    const acceptedConnections = connections.filter(c => c.status === 'accepted').length;

    // Top performing startup
    const topStartup = startups.sort((a, b) => b.engagementScore - a.engagementScore)[0];

    // Category distribution
    const categoryMap = {};
    startups.forEach(s => {
      categoryMap[s.category] = (categoryMap[s.category] || 0) + 1;
    });

    res.json({
      summary: {
        totalStartups: startups.length,
        totalViews,
        totalLikes,
        totalBookmarks,
        totalInterested,
        avgEngagementScore: avgScore,
        acceptedConnections,
        pendingConnections: connections.filter(c => c.status === 'pending').length
      },
      topStartup,
      startups: startups.map(s => ({
        _id: s._id,
        name: s.name,
        engagementScore: s.engagementScore,
        views: s.views,
        likes: s.likes.length,
        interestedInvestors: s.interestedInvestors.length,
        stage: s.stage,
        category: s.category
      })),
      categoryDistribution: categoryMap
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

// @route   GET /api/analytics/platform
// @desc    Get platform-wide stats (public)
router.get('/platform', protect, async (req, res) => {
  try {
    const totalStartups = await Startup.countDocuments({ status: 'active' });
    const totalFounders = await User.countDocuments({ role: 'founder' });
    const totalInvestors = await User.countDocuments({ role: 'investor' });
    const totalConnections = await Connection.countDocuments({ status: 'accepted' });

    const topStartups = await Startup.find({ status: 'active' })
      .sort({ engagementScore: -1 })
      .limit(5)
      .populate('founder', 'name avatar department');

    const categories = await Startup.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      stats: { totalStartups, totalFounders, totalInvestors, totalConnections },
      topStartups,
      categories
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching platform stats' });
  }
});

module.exports = router;