/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method:'POST',
      url:'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/')
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }

};

export const logout = async () => {
  try {
    const res = await axios({
      method:'GET',
      url:'http://127.0.0.1:3000/api/v1/users/logout',
    });
    //we will reload page here, and browser will detect the non valid cookie, and browser will show there is no user logged in.
    if(res.data.status === 'success') location.reload(true);
  } catch(err) {
    showAlert('error', 'Error loggin out! Try again.')
  }
};

export const signup = async (data) => {
  // data is coming well formated to pass directly to the body request of signup
  try {
    const res = await axios({
      method:'POST',
      url:'http://127.0.0.1:3000/api/v1/users/signup',
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'User created sucessfully!');
      window.setTimeout(() => {
        location.assign('/')
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
  
};

export const forgotPassword = async (email) => {
  try {
    const res = await axios({
      method:'POST',
      url:'http://127.0.0.1:3000/api/v1/users/forgotpassword',
      data: { email }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Check your email to reset your passport!');
      window.setTimeout(() => {
        location.assign('/')
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
  
};

export const resetPassword = async (password, passwordConfirm, token) => {
  try {
    const res = await axios({
      method:'PATCH',
      url:`http://127.0.0.1:3000/api/v1/users/resetpassword/${token}`,
      data: {
        password,
        passwordConfirm,
       },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Your password was reset successfully!');
      window.setTimeout(() => {
        location.assign('/')
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
  
};
