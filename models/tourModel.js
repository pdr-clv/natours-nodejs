const mongoose = require('mongoose');
const slugify = require('slugify');
//const User = require('./userModel.js');
//const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters'],
      //validate: [validator.isAlpha, 'Tour name must contain only letters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group Size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //this only points to current doc or NEW document creation, will not validate when you do UPDATE.
          return val < this.price;
        },
        message: 'Discount Price {VALUE} should be below price tour',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, //this field will not be visible in queries, this is the way how you can hide sensitive data
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //Geo Json
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    //guides: Array, this is if we want to embed data, to normalize data, we have to do as it follows.
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  //we use function, not an arrow function, because function has access to this, and arrow function has all variable encapsulated.
  return this.duration / 7;
});

//DOCUMENT MIDDLEWARE: runs before save() and create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

/* This code is if we want to embed guides data in our data base
//we will insert a user Id, and we will pass all info there is in user collection to embed in database.
tourSchema.pre('save', async function (next) {
  const guidesPromises = this.guides.map(async (id) => await User.findById(id));
  //guidesPromises is an Array with promises, we will await for all of them, and we will assing result to this.guides, and now it will be an array full with all info of users, not only id.
  this.guides = await Promise.all(guidesPromises);
  next();
}); */
/*
tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});*/

//QUERY MIDDLEWARE for queries, point to a query. It is not working for findbyId/findOne
//QUERY MIDDLEWARE for findOne. We will use regular expression and it will work for all queries which start by find.

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  //we can create a propery in the query called start, and after query, we can access to in, and to get value of time for query.
  this.start = Date.now();
  next();
});
//this middleware will populate guides with information of users, which it is binded with ObjectId
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} miliseconds)`);
  next();
});

//AGGREGATION MIDDLEWARE

tourSchema.pre('aggregate', function (next) {
  //pipeline object hast the information of the query. We can chain another match state previous to match or the aggregation
  //pipeline is an array. we will add one element to the beginning of array with unshift
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  //console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
