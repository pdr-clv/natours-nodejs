const multer = require('multer');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const { deleteOne, updateOne, getOne, getAll } = factory;

//multer json settings, we create multerStore and multerFilter
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    // name unique will be user-iduser-timestampinmilisecons.jpeg
    //property file (added by multer) has information to use here to create filename.
    const extensionFile = file.mimetype.split('/')[1]; //jpeg, png, etc.
    cb(null, `user-${req.user.id}-${Date.now()}.${extensionFile}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError('File is not an image! Please upload only images', 400),
      false
    );
  }
};

//multer is a middleware function to process files, store them and more options.
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

//we add this getMe middleware for the route /me, because there is no spcification of params.id in the url, it will get the user._id from the user logged in.
exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //middleware multer add the file object in the request
  //console.log(req.file);
  //this function is to update current User logged, but not to change password, for password you have to use the route /updatepassword
  //1) Create error is user post password in the body. We don't want to update password.
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updatepassword',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields we don't want to update if they are coming in the req.body
  //We will create a filteredBody, with the only field can modify the user, we will make sure user doesn't change another properties like role.
  const filteredBody = filterObj(req.body, 'name', 'email');
  //if we upload photo, it will be detected becasue req.file is not null. Then we will add property photo there.file.filename, the new photo.
  if (req.file) filteredBody.photo = req.file.filename;
  // 3) Update user dodument
  //await user.save(); we will not run user.save() we used it for passwords, because only with save can run validators and middleware.
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not working!! Please use /signup route',
  });
};

exports.getAllUsers = getAll(User);
exports.getUser = getOne(User);
//Do not change passwords with this option.
exports.updateUser = updateOne(User);
exports.deleteUser = deleteOne(User);
