/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe('pk_test_51I0SLgA8Kj6Oi952x8w8R0iGoYDzejlQ0LCAJCMC7vi8bXcGSsl9trqnGDC7HLnEaKTn3MvNVwG2z8rL2bGMwpxu00z8fH5pgj');
export const bookTour = async(tourId) => {
  try {
    //1. Get checkout session from API
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`
    );
    //when it is simply get result, without data or body, and get request, we can use axios like this.
    //2. Create checkout form + charge credit card
    await stripe.redirectToCheckout({ 
      sessionId: session.data.session.id
    });
  } catch(err) {
    console.log(err);
    showAlert('error',err.message)
  }
  
}