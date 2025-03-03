const fs = require('fs');
const colors = require('colors');
const dotenv = require('dotenv');
const Course = require('../models/Course');
const connectDB = require("../config/db");

// Load environment variables - adjust path as needed
// Make sure this path points to your .env file
dotenv.config({ path: '../.env' });

// Verify environment variables are loaded
console.log('Environment check:');
console.log('MONGO_URI exists:', process.env.MONGO_URI ? 'Yes' : 'No');

// Connect to database
connectDB();

// Read JSON data
const importData = async () => {
  try {
    // Read the JSON data from file - adjust path as needed
    const courses = JSON.parse(
      fs.readFileSync('./course.json', 'utf-8')
    );
    
    console.log(`Found ${courses.length} courses to import`);
    
    // Insert data into database
    await Course.create(courses);
    
    console.log('Data successfully imported!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red);
    process.exit(1);
  }
};

// Delete all existing data
const deleteData = async () => {
  try {
    await Course.deleteMany({});
    
    console.log('All data successfully deleted!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red);
    process.exit(1);
  }
};

// Process command line arguments
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log(`
Please provide proper command:
  -i    Import data to database
  -d    Delete all data from database
  `.yellow);
  process.exit();
}