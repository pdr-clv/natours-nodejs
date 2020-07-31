const fs = require('fs');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

//2. Route handlers

exports.checkID = (req,res,next,val) => {
    //all values params in the url are stored in req.params, it is an object with the fields {id:'4'}
  //we convert to number multiply by 1 
  if (val*1 >= tours.length) {
    return res.status(404).json({
      status:'fail',
      message:'Number tour not valid'
    });
  }
  next();
};

exports.checkBody = (req,res,next) => {

//we check if req.body object is empty
    if (Object.keys(req.body).length === 0 ){
      return res.status(400).json({
        status:'fail',
        message:"Bad request! Body can't be empty"
      });
//else, check if properties name and price are with data, obligatory fields.
    } else if (!req.body.name || !req.body.price) {
      return res.status(400).json({
        status:'fail',
        message:"Bad request! At least fields name and price must be filled with data"
      });
    }
  next();
}

exports.getAllTours = (req,res) => {
  console.log(req.requestTime);
  res
    .status(200)
    .json({
      status:'sucess',
      requestedAt:req.requestTime,
      results:tours.length,
      data: {
        tours
      }
    });
};

exports.getTour = (req,res) => {
  const id = req.params.id * 1;
  const tour = tours.find(el => el.id === id);

  res
    .status(200)
    .json({
      status:'sucess',
      data: {
        tour
      }
    });  
};

exports.createTour = (req,res) => {

  const newId = tours[tours.length - 1].id + 1;
//Object.assign can merge two objects in one
  const newTour = Object.assign(
    { id: newId },
    req.body
  );

  tours.push(newTour);

  fs.writeFile(`${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours), 
    (err) => {
      if (err) throw err;
      res.status(201).json({
        status:'sucess',
        data:{
          tour:newTour
        }
      });
    }
  );
};

exports.updateTour = (req,res) => {

  res.status(200).json({
    status:'sucess',
    data:'Data will be updated'
  });

};

exports.deleteTour = (req,res) => {

  res.status(204).json({
    status:'sucess',
    data:null
  });

};