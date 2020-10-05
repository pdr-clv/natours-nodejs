//With this file we will create an import and delete data from database
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  //  .connect(process.env.DATABASE_LOCAL), {
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB conecction sucessful'));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

//IMPORTA DATA INTO DB

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Tours collection was imported successfull');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//DELETE ALL DATA FROM DB

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('All Tours were succesfull deleted from Tours collection');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//To run this script, we have to type  node dev-data/data/import-dev-data.js in node-projects/natours and expecify --import or --delete

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else {
  console.log('Run arguments --import or --delete');
  process.exit();
}
//console.log(process.argv);
