const fs = require('fs');
const express = require('express');
const { restart } = require('nodemon');

const app = express();

//Middleware will catch request before receiving inside the post callback, and it will transform request body into a json.
app.use(express.json());


const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

//console.log(JSON.parse(tours));

//app.get('/', (req,res) => {
//  res
//    .status(200)
//    .json({
//      message:'Hello form the server side...', 
//      app:'Natours'
//    });
//}); 

//app.post('/',(req,res) => {
//  res
//    .status(200)
//    .send('You can post to this endpoint...');
//});

app.get('/api/v1/tours', (req,res) => {
  res
    .status(200)
    .json({
      status:'sucess',
      results:tours.length,
      data: {
        tours
      }
    });
}); 

app.get('/api/v1/tours/:id', (req,res) => {
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

}); 

app.post('/api/v1/tours', (req,res) => {

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
}); 

app.patch('/api/v1/tours/:id', (req,res) => {

  //all values params in the url are stored in req.params, it is an object with the fields {id:'4'}
  const id = req.params.id*1;
  console.log(id);
  console.log(req.body);
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

});

app.delete('/api/v1/tours/:id', (req,res) => {

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

});


const port = 3000;

app.listen(port,() => console.log(`App running on port ${port}...`));
