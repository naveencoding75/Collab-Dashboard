const mongoose = require('mongoose');

const DatasetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String, 
    required: true
  },
  tableName: { // We will create a unique SQL table for each upload
    type: String, 
    required: true
  },
  rowCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Dataset', DatasetSchema);