const mongoose = require('mongoose');

const startupSchema = new mongoose.Schema({
  founder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Startup name is required'],
    trim: true
  },
  tagline: {
    type: String,
    required: [true, 'Tagline is required'],
    maxlength: 150
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'EdTech', 'FinTech', 'HealthTech', 'AgriTech', 'CleanTech',
      'E-Commerce', 'SaaS', 'AI/ML', 'IoT', 'Blockchain',
      'Social Impact', 'Entertainment', 'Logistics', 'Other'
    ]
  },
  stage: {
    type: String,
    enum: ['Idea', 'MVP', 'Early Traction', 'Growth', 'Scale'],
    default: 'Idea'
  },
  department: {
    type: String,
    required: true
  },
  university: {
    type: String,
    default: ''
  },
  fundingRequired: {
    type: Number,
    default: 0
  },
  fundingRaised: {
    type: Number,
    default: 0
  },
  equity: {
    type: Number,
    default: 0
  },
  teamSize: {
    type: Number,
    default: 1
  },
  website: {
    type: String,
    default: ''
  },
  pitchDeck: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    default: ''
  },
  tags: [{
    type: String
  }],
  problemStatement: {
    type: String,
    default: ''
  },
  solution: {
    type: String,
    default: ''
  },
  targetMarket: {
    type: String,
    default: ''
  },
  revenue: {
    type: Number,
    default: 0
  },
  // Engagement & Scoring
  engagementScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  interestedInvestors: [{
    investor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    expressedAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['active', 'funded', 'paused', 'closed'],
    default: 'active'
  },
  // Analytics
  weeklyViews: [{ week: String, count: Number }],
  monthlyEngagement: [{ month: String, score: Number }]
}, {
  timestamps: true
});

// Auto-calculate engagement score before saving
startupSchema.pre('save', function(next) {
  let score = 0;

  // Views contribution (max 20 points)
  score += Math.min(this.views * 0.1, 20);

  // Likes contribution (max 25 points)
  score += Math.min(this.likes.length * 2, 25);

  // Bookmarks (max 15 points)
  score += Math.min(this.bookmarks.length * 3, 15);

  // Investor interest (max 25 points)
  score += Math.min(this.interestedInvestors.length * 5, 25);

  // Profile completeness (max 15 points)
  let completeness = 0;
  if (this.description) completeness += 3;
  if (this.problemStatement) completeness += 3;
  if (this.solution) completeness += 3;
  if (this.targetMarket) completeness += 3;
  if (this.website) completeness += 3;
  score += completeness;

  this.engagementScore = Math.round(Math.min(score, 100));
  next();
});

module.exports = mongoose.model('Startup', startupSchema);