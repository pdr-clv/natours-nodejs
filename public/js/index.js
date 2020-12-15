/* eslint-disable */
//we import babel in order to run javascript with normal behaviour in all browsers
import '@babel/polyfill';
//index.js will be the entry point for all javascript functionality of page, and other js files (or modules) that will be only functions imported here to use them.
//bundler is watching any js file modification here, and updates the bundle.js common file that will be the one in application with all javascript functionality for all pages.

import { login } from './login';
import { displayMap } from './mapbox';

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form')

//DELEGATION OF FUNCTIONS
if (mapBox) {
  //TRICK we get information of locations, the one was passed using the trick of property data-locations in template.
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}


