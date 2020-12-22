import axios from 'axios';
import { showAlert } from './alert';

//we have function updateSettings, we will pass an object called data, it can contain personal data (name, email) or passwords to modiffy, because we can't change password using another url request.
// type is if we are going to change personal data or password.
export const updateSettings = async (data, type) => {
  const urlEndPoint = type === 'password' ? 'updatepassword' : 'updateme';
  try {
    const res = await axios({
      method:'PATCH',
      url:`/api/v1/users/${urlEndPoint}`,
      data
    });
    if (res.data.status === 'success') {
      //we make first letter capital, to make a better experience to the user, reading properly first word in capital in the alert.
      const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1);
      showAlert('success', `${typeCapitalized} updated successfully!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }

};