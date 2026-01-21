const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// --- MongoDB Connection (For Users & Metadata) ---
const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  }
};

// --- MySQL Connection (For CSV Data Rows) ---
// We use Sequelize ORM for easier handling of SQL tables
const sequelize = new Sequelize(
  process.env.MYSQL_DB,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',
    logging: false, // Turn off SQL logging in console to keep it clean
  }
);

const connectMySQL = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Connected');
    // Sync models (create tables if they don't exist)
    // await sequelize.sync(); 
  } catch (err) {
    console.error('❌ MySQL Connection Error:', err);
  }
};

module.exports = { connectMongo, connectMySQL, sequelize };