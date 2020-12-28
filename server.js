const mongoose = require('mongoose');
const dotenv = require('dotenv');

//we add this listener for uncaught exceptions. errors like console.log(x) x doesn't exists.
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('Uncaught exception: Shutting down ...');
  //we shutdown application.
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

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

const port = process.env.PORT || 3000;

const server = app.listen(port, () => console.log(`App running on port ${port}...`));

//the file we have to execute nodemon server.js, we will include in package.json in script -> start, and we will innitialize our application always with npm start / yarn start
//we add an event listener. when there is a process.on and the name of event.

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  //this if is just to catch if there is no Internet connection.
  if (err.message.includes('ESERVFAIL')) {
    console.log('Check Internet connection.');
  }
  console.log('Unhadler rejection: Shutting down ...');
  //we shutdown server.
  server.close(() => process.exit(1));
});

//every 24 hours heroku close app, if we detect this SIGTERM, we close it gently and gracefully to finish all pending request before shutting down.
process.on('SIGTERM', () => {
  console.log('SIGTERM Received by server. Shutting down gracefully!');

  server.close(() => console.log('Process terminated!'));
});
