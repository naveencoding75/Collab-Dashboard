const fs = require('fs');
const csv = require('csv-parser');
const Dataset = require('../models/Dataset');
const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

// @desc    Upload CSV and process data
// @route   POST /api/datasets/upload
exports.uploadDataset = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const originalName = req.file.originalname;
  const tableName = `data_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const results = [];
  const headers = [];

  // 1. Read CSV Stream
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('headers', (headerList) => {
      headerList.forEach((h) => headers.push(h));
    })
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        // 2. Dynamically define SQL Table Model
        const attributes = {};
        
        // Add ID explicitly to ensure order
        attributes['id'] = {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        };

        headers.forEach((header) => {
          attributes[header] = { type: DataTypes.TEXT }; 
        });

        const DynamicModel = sequelize.define(tableName, attributes, {
            timestamps: false,
            freezeTableName: true 
        });

        // 3. Sync Table
        await DynamicModel.sync(); 

        // FIX: Map the results to ensure explicit ID ordering
        // This forces "January" (index 0) to be ID 1, "February" ID 2, etc.
        const rowsWithId = results.map((row, index) => ({
            ...row,
            id: index + 1
        }));

        await DynamicModel.bulkCreate(rowsWithId); 

        // 4. Save Metadata to MongoDB
        const dataset = await Dataset.create({
          user: req.user._id,
          filename: req.file.filename,
          originalName,
          tableName,
          rowCount: results.length
        });

        fs.unlinkSync(filePath);

        res.status(201).json({ 
          message: 'Dataset processed successfully', 
          dataset 
        });

      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing CSV' });
      }
    });
};

// @desc    Get all datasets for logged-in user
// @route   GET /api/datasets
exports.getDatasets = async (req, res) => {
  try {
    const datasets = await Dataset.find({}).populate('user', 'username').sort({ createdAt: -1 });
    res.json(datasets);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get actual data rows from MySQL
// @route   GET /api/datasets/:id
exports.getDatasetData = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id);
    
    if (!dataset) {
      return res.status(404).json({ message: 'Dataset not found' });
    }

    // FIX: "ORDER BY id ASC" guarantees the graph follows the CSV order
    const [results, metadata] = await sequelize.query(`SELECT * FROM ${dataset.tableName} ORDER BY id ASC LIMIT 1000`);

    res.json({
      metadata: dataset,
      data: results
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching data' });
  }
};