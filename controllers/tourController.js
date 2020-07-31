const fs = require('fs');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

//2. Route handlers
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
//all values params in the url are stored in req.params, it is an object with the fields {id:'4'}
  const id = req.params.id*1;
//we convert to number multiply by 1 
  const tour = tours.find(el => el.id === id);
//  if (id >= tours.length) {
  if (!tour) {
    return res.status(404).json({
      status:'fail',
      message:'Number tour not valid'
    });
  }
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

  //all values params in the url are stored in req.params, it is an object with the fields {id:'4'}
  const id = req.params.id*1;
  //console.log(id);
  //console.log(req.body);
//we convert to number multiply by 1 
  if (id >= tours.length) {
    return res.status(404).json({
      status:'fail',
      message:'Number tour not valid to update'
    });
  }

  res.status(200).json({
    status:'sucess',
    data:'Data will be updated'
  });

};

exports.deleteTour = (req,res) => {

  //all values params in the url are stored in req.params, it is an object with the fields {id:'4'}
  const id = req.params.id*1;
  console.log(id);
//we convert to number multiply by 1 
  if (id >= tours.length) {
    return res.status(404).json({
      status:'fail',
      message:'Number tour not valid to delete'
    });
  }

  res.status(204).json({
    status:'sucess',
    data:null
  });

};