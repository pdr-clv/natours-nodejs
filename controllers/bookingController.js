const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
//const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const { getAll, getOne, createOne, updateOne, deleteOne } = factory;

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //1. Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  //2. Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    //when success_url is hited, we want to create a booking, we add in the url query strings, because we have no coince to pass this parameters in a body post request
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    /* //this is from documentation, but it works like Jonas did in course
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Stubborn Attachments',
            images: ['https://i.imgur.com/EHyR2nP.png'],
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    */
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
  });
  //3. Send session to client as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckOut = catchAsync(async (req, res, next) => {
  //This is only temporary, everytone can make bookings without paying.
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });

  //we will redirect to the original url of the request, but we remove from url out what is ahead from ?, that has the sensitive data.
  res.redirect(req.originalUrl.split('?')[0]);
});

exports.getAllBookings = getAll(Booking);
exports.getBooking = getOne(Booking);
exports.createBooking = createOne(Booking);
exports.updateBooking = updateOne(Booking);
exports.deleteBooking = deleteOne(Booking);
