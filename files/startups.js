const express = require('express');
const router = express.Router();
const Startup = require('../models/Startup');
const User = require('../models/User');
const { protect, founderOnly, investorOnly } = require('../middleware/auth');

// @route   POST /api/startups
// @desc    Register a new startup (founders only)
router.post('/', protect, founderOnly, async (req, res) => {
  try {
    const founder = await User.findById(req.user._id);
    const startupData = {
      ...req.body,
      founder: req.user._id,
      department: req.body.department || founder.department,
      university: req.body.university || founder.university
    };

    const startup = await Startup.create(startupData);
    res.status(201).json({ message: 'Startup registered successfully!', startup });
  } catch (error) {
    res.status(500).json({ message: 'Error creating startup', error: error.message });
  }
});

// @route   GET /api/startups
// @desc    Get all active startups (for investors to browse)
router.get('/', protect, async (req, res) => {
  try {
    const { category, stage, search, sort } = req.query;
    let query = { status: 'active' };

    if (category) query.category = category;
    if (stage) query.stage = stage;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tagline: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'engagement') sortOption = { engagementScore: -1 };
    if (sort === 'views') sortOption = { views: -1 };
    if (sort === 'likes') sortOption = { 'likes': -1 };

    const startups = await Startup.find(query)
      .populate('founder', 'name email department university avatar')
      .sort(sortOption);

    res.json(startups);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching startups', error: error.message });
  }
});

// @route   GET /api/startups/my
// @desc    Get founder's own startups
router.get('/my', protect, founderOnly, async (req, res) => {
  try {
    const startups = await Startup.find({ founder: req.user._id })
      .sort({ createdAt: -1 });
    res.json(startups);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching startups' });
  }
});

// @route   GET /api/startups/:id
// @desc    Get single startup details
router.get('/:id', protect, async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id)
      .populate('founder', 'name email department university bio linkedIn phone avatar')
      .populate('interestedInvestors.investor', 'name firm avatar');

    if (!startup) {
      return res.status(404).json({ message: 'Startup not found' });
    }

    // Track view (only for non-founders)
    if (req.user.role === 'investor' || startup.founder._id.toString() !== req.user._id.toString()) {
      await Startup.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    }

    res.json(startup);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching startup', error: error.message });
  }
});

// @route   PUT /api/startups/:id
// @desc    Update startup
router.put('/:id', protect, founderOnly, async (req, res) => {
  try {
    const startup = await Startup.findOne({ _id: req.params.id, founder: req.user._id });
    if (!startup) {
      return res.status(404).json({ message: 'Startup not found or unauthorized' });
    }

    const updated = await Startup.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ message: 'Startup updated!', startup: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating startup', error: error.message });
  }
});

// @route   POST /api/startups/:id/like
// @desc    Like/unlike a startup
router.post('/:id/like', protect, async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);
    if (!startup) return res.status(404).json({ message: 'Startup not found' });

    const userId = req.user._id;
    const alreadyLiked = startup.likes.includes(userId);

    if (alreadyLiked) {
      startup.likes = startup.likes.filter(id => id.toString() !== userId.toString());
    } else {
      startup.likes.push(userId);
    }

    await startup.save();
    res.json({ liked: !alreadyLiked, likesCount: startup.likes.length, engagementScore: startup.engagementScore });
  } catch (error) {
    res.status(500).json({ message: 'Error liking startup' });
  }
});

// @route   POST /api/startups/:id/bookmark
// @desc    Bookmark/unbookmark a startup
router.post('/:id/bookmark', protect, async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);
    if (!startup) return res.status(404).json({ message: 'Startup not found' });

    const userId = req.user._id;
    const alreadyBookmarked = startup.bookmarks.includes(userId);

    if (alreadyBookmarked) {
      startup.bookmarks = startup.bookmarks.filter(id => id.toString() !== userId.toString());
    } else {
      startup.bookmarks.push(userId);
    }

    await startup.save();
    res.json({ bookmarked: !alreadyBookmarked });
  } catch (error) {
    res.status(500).json({ message: 'Error bookmarking startup' });
  }
});

// @route   POST /api/startups/:id/interest
// @desc    Investor expresses interest in startup
router.post('/:id/interest', protect, investorOnly, async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id).populate('founder');
    if (!startup) return res.status(404).json({ message: 'Startup not found' });

    const alreadyInterested = startup.interestedInvestors.some(
      item => item.investor.toString() === req.user._id.toString()
    );

    if (!alreadyInterested) {
      startup.interestedInvestors.push({ investor: req.user._id });
      await startup.save();

      // Notify the founder
      await User.findByIdAndUpdate(startup.founder._id, {
        $push: {
          notifications: {
            message: `Investor ${req.user.name} is interested in your startup "${startup.name}"!`,
            type: 'interest'
          }
        }
      });
    }

    res.json({ message: 'Interest expressed!', interestedCount: startup.interestedInvestors.length });
  } catch (error) {
    res.status(500).json({ message: 'Error expressing interest' });
  }
});

// @route   GET /api/startups/:id/analytics
// @desc    Get startup analytics (founder only)
router.get('/:id/analytics', protect, founderOnly, async (req, res) => {
  try {
    const startup = await Startup.findOne({ _id: req.params.id, founder: req.user._id });
    if (!startup) return res.status(404).json({ message: 'Not found or unauthorized' });

    const analytics = {
      views: startup.views,
      likes: startup.likes.length,
      bookmarks: startup.bookmarks.length,
      interestedInvestors: startup.interestedInvestors.length,
      engagementScore: startup.engagementScore,
      fundingProgress: startup.fundingRequired > 0
        ? Math.round((startup.fundingRaised / startup.fundingRequired) * 100)
        : 0
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

module.exports = router;