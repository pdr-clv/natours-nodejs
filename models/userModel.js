const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User name it is a required field'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'e-mail it is a required field'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please insert a valid e-mail'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Password it is a required field'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //this only works on CREATE and SAVE. Doesn't work with UPDATE.
      validator: function (val) {
        return val === this.password;
      },
      message: 'Password and PasswordConfirm are not the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  //first of all, if password hasn't been modified, we will go next, we will not run anything.
  if (!this.isModified('password')) next();
  //if password has been modiffied. We set 12 level encription, it is more than enough.
  this.password = await bcrypt.hash(this.password, 12);
  //passwordConfirm, once did validation, it doesn't make sense to store it in database, we set it undefined.
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  //this middleware is for reset property passwordChangedAt. If password is not modified or document is new, then next
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; //we take out one second, because if passwordChangedAt is greater than the following JWT token we will get, we will have problems logging in.
  next();
});
//with this middleware, I can filter always users that they are active, if they are no actives, they will not be shown up
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.isCorrectPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const passwordTimeStamp = this.passwordChangedAt.getTime() / 1000;
    return JWTTimeStamp < passwordTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  //cryptofuncition create a randomBytes, with number of characters 32, and we translated into hexadecimal.
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  //it iwll expire en 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
