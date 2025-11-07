const mongoose = require('mongoose');

const ShapeSchema = new mongoose.Schema({
  type: { type: String, enum: ['pencil','line','circle','arrow','text','rectangle'], required: true },
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  rotation: { type: Number, default: 0 },
  color: { type: String, default: '#000000' },
  strokeWidth: { type: Number, default: 2 },
  fontSize: { type: Number, default: 16 },
  fontFamily: { type: String, default: 'Arial' },
  content: { type: String, default: '' },
  points: { type: Array, default: [] },
  pageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Page', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ShapeSchema.pre('save', function(next){ this.updatedAt = Date.now(); next(); });
ShapeSchema.pre('findOneAndUpdate', function(next){ this._update.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('Shape', ShapeSchema);
