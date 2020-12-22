/* eslint-disable */
//we import babel in order to run javascript with normal behaviour in all browsers
import '@babel/polyfill';
//index.js will be the entry point for all javascript functionality of page, and other js files (or modules) that will be only functions imported here to use them.
//bundler is watching any js file modification here, and updates the bundle.js common file that will be the one in application with all javascript functionality for all pages.

import { login, logout, signup, forgotPassword, resetPassword } from './login';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const accountForm = document.querySelector('.form-user-data');
const changePassForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const signUpForm = document.querySelector('.form--signup');
const forgotPasswordForm = document.querySelector('.form--forgotpassword');
const resetPasswordForm = document.querySelector('.form--reset-password')

//DELEGATION OF FUNCTIONS
if (mapBox) {
  //TRICK we get information of locations, the one was passed using the trick of property data-locations in template.
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm)
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
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

if (bookBtn) 
  bookBtn.addEventListener('click', async (e) =>{
    e.preventDefault();
    e.target.textContent = 'Processing ...';
    //const tourId = e.target.dataset.tourId // data-tour-id in property, becomes tourId del dataset
    const { tourId } = e.target.dataset
    await bookTour(tourId);
    e.target.textContent = 'Book tour now!';
  });

if (signUpForm)
  signUpForm.addEventListener('submit', async(e) => {
    e.preventDefault();
    document.querySelector('.btn--green').disable = true;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await signup({name, email, password, passwordConfirm});
    document.querySelector('.btn--save-password').disable = false;
  });

if (forgotPasswordForm)
  forgotPasswordForm.addEventListener('submit', e=> {
    e.preventDefault();
    const email = document.getElementById('email').value;
    forgotPassword(email);
  });
if (resetPasswordForm)
  resetPasswordForm.addEventListener('submit', e=> {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    const token = window.location.href.split('?')[1];
    resetPassword(password, passwordConfirm, token);
  })

