/* eslint-disable */
//we import babel in order to run javascript with normal behaviour in all browsers
import '@babel/polyfill';
//index.js will be the entry point for all javascript functionality of page, and other js files (or modules) that will be only functions imported here to use them.
//bundler is watching any js file modification here, and updates the bundle.js common file that will be the one in application with all javascript functionality for all pages.

import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const accountForm = document.querySelector('.form-user-data');
const changePassForm = document.querySelector('.form-user-password');

//DELEGATION OF FUNCTIONS
if (mapBox) {
  //TRICK we get information of locations, the one was passed using the trick of property data-locations in template.
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm)
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    login(name, email);
  });

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (accountForm)
  accountForm.addEventListener('submit', e => {
    e.preventDefault();
    //we must recreate a multipart form data to include image to upload with backEnd.
    const form = new FormData();
    
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    
    updateSettings(form, 'data');
  });

if (changePassForm)
  changePassForm.addEventListener('submit', async e=> {
    e.preventDefault();
    //little trick to create an animation, instead an spinner to inform user password is updating while the async request.
    document.querySelector('.btn--save-password').textContent = 'Updating ...';
    const password = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const newPasswordConfirm = document.getElementById('password-confirm').value;
    await updateSettings({ password, newPassword, newPasswordConfirm }, 'password');
    //we wait for async functions updateSettings, and later we will clear text-inputs.
    document.querySelector('.btn--save-password').textContent = 'Save Password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });



