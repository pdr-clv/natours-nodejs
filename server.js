const mongoose = require('mongoose');
const dotenv = require('dotenv');

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

app.listen(port, () => console.log(`App running on port ${port}...`));

//the file we have to execute nodemon server.js, we will include in package.json in script -> start, and we will innitialize our application always with npm start / yarn start
