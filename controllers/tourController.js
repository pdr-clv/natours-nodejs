const Tour = require('../models/tourModel');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  //1A Filtering req.query coming for the request. Excluding elements page, sort and limit.
  let queryObj = { ...req.query };
  console.log(queryObj);
  const exclude = ['page', 'sort', 'limit', 'fields'];
  exclude.forEach((element) => delete queryObj[element]);
  //1B Filter advanced, adding posibility of gte, gt, lte and lt in the request querry.
  queryObj = JSON.stringify(queryObj);
  queryObj = JSON.parse(
    queryObj.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
  );
  //query is an object, we will defined like let, because we will chain other queries, before performing await, after doing await will be a collection filtered. You can chain filter methods to query object, before getting await value.
  let query = Tour.find(queryObj);
  //2 Sorting collection obtained from query.
  if (req.query.sort) {
    //we create sortBy, we get request.sort, we split it into an array, spliting by comma, and we join it into an string separated with spaces, this is the argument that needs sort
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
    //if we want to sort by several fields, ve can chain with spaces sort('price' 'ratingsAverage' 'etc')
  } else {
    //default sort by createdAt descending.
    query = query.sort('-createdAt');
  }
  //3 Fields showed and limited, we can show only few fields, like name, price etc. it works like sort, we have to separate by space the chain of fields we want to show
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
    //you can also hide fields in the search adding -name, and name will not be showed in query Collection
  } else {
    //default fields filter is to remove the __v, Mongo uses it, but we don't need it.
    query = query.select('-__v');
  }
  // Pagination. default values, after ||, but if there are values in req.query, they will be accepted in the query.
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  try {
    //error handling if page selected is higher than total of pages. we ha to do this error here inside try block.
    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exists');
    }
    //now we can await for the query, and we will get tours collections.
    const tours = await query;
    res.status(200).json({
      status: 'sucess',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'sucess',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'sucess',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'sucess',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'sucess',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
