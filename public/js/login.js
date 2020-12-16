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
      showAlert('success', 'Logged in sucessfully!');
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
