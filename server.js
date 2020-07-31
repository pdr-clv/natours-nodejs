//we create this file, in order to have separated everything related about app, express, and server features.
//we will import app from app.js, and we will listen server.

const app= require('./app');
// 4. Start server
const port = 3000;

app.listen(port,() => console.log(`App running on port ${port}...`));

//the file we have to execute nodemon server.js, we will include in package.json in script -> start, and we will innitialize our application always with npm start / yarn start
