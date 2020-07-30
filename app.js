const fs = require('fs');
const express = require('express');
const { restart } = require('nodemon');
const morgan = require('morgan');

const app = express();

//1. Middlewares

//app.use method is in order to use middleware
//morgan is third part middleware which provides a console.log with few details of info. It has several arguments, interesting the one is 'dev'
app.use(morgan('dev'));
//Middleware will catch request before receiving inside the post callback, and it will transform request body into a json.
app.use(express.json());

//this is our own middleware function, we have to use params req, res, y next is obligatory, otherwise, never will go next step of middleware stack
// if there is an response before middleware, never will be executed. it is better if they are on top.
app.use((req,res,next) => {
  console.log('Hello from the middleware');
  next();
});
//this middleare catch the url requested.
app.use((req,res,next) => {
  console.log(console.log('Current url requested: ',req.originalUrl));
  next();
});
//this middleware add date/time of request
app.use((req,res,next) => {
//we define new property in request called req.requestTime
  req.requestTime = new Date().toISOString();
  next();
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

//2. Route handlers
const getAllTours = (req,res) => {
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

const getTour = (req,res) => {
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

const createTour = (req,res) => {

  const newId = tours[tours.length - 1].id + 1;
//Object.assign can merge two objects in one
  const newTour = Object.assign(
    { id: newId },
    req.body
  );

  tours.push(newTour);

  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,
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

const updateTour = (req,res) => {

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

const deleteTour = (req,res) => {

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

const getAllUsers = (req,res) => {
  res.status(500)
    .json({
      status:'error',
      message:'This route is not yet defined'
    });
};

const createUser = (req,res) => {
  res.status(500)
    .json({
      status:'error',
      message:'This route is not yet defined'
    });
};

const getUser = (req,res) => {
  res.status(500)
    .json({
      status:'error',
      message:'This route is not yet defined'
    });
};

const updateUser = (req,res) => {
  res.status(500)
    .json({
      status:'error',
      message:'This route is not yet defined'
    });
};

const deleteUser = (req,res) => {
  res.status(500)
    .json({
      status:'error',
      message:'This route is not yet defined'
    });
};

// 3. Routes

//app.get('/api/v1/tours', getAllTours); 
//app.post('/api/v1/tours', createTour);
//app.get('/api/v1/tours/:id', getTour);  
//app.patch('/api/v1/tours/:id', updateTour);
//app.delete('/api/v1/tours/:id', deleteTour);

//we can create route, and later chain all http methods you can request to that endpoing/route
//we writedown route in only one place, and we chain all methods to route. It is ideal not to repeat route many places.
app
  .route('/api/v1/tours')
  .get(getAllTours)
  .post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

app
  .route('/api/v1/users')
  .get(getAllUsers)
  .post(createUser);

app
  .route('/api/v1/users/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

// 4. Start server
const port = 3000;

app.listen(port,() => console.log(`App running on port ${port}...`));
