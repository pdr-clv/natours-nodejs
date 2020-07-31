const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app= require('./app');


const port = process.env.PORT || 3000;

app.listen(port,() => console.log(`App running on port ${port}...`));

//the file we have to execute nodemon server.js, we will include in package.json in script -> start, and we will innitialize our application always with npm start / yarn start
