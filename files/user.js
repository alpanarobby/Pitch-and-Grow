const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['founder', 'investor'],
    required: [true, 'Role is required']
  },
  avatar: {
    type: String,
    default: ''
  },
  // Founder-specific fields
  department: {
    type: String,
    default: ''
  },
  university: {
    type: String,
    default: ''
  },
  studentId: {
    type: String,
    default: ''
  },
  // Investor-specific fields
  firm: {
    type: String,
    default: ''
  },
  investmentFocus: [{
    type: String
  }],
  minInvestment: {
    type: Number,
    default: 0
  },
  maxInvestment: {
    type: Number,
    default: 0
  },
  bio: {
    type: String,
    default: ''
  },
  linkedIn: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  notifications: [{
    message: String,
    type: { type: String, enum: ['connection', 'interest', 'system'] },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);