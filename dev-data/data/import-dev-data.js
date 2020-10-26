//With this file we will create an import and delete data from database
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

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
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

//IMPORTA DATA INTO DB

const importData = async () => {
  try {
    await Tour.create(tours);
    //if we add validateBeforeSave: false, we will not get validation error of ConfirmPassword doesn't match Passowr
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log(
      'Tours, Users and REviews collections were imported successfull'
    );
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//DELETE ALL DATA FROM DB

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('All Data from data base was succesfull deleted');
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
