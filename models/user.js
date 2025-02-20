const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 8,
  },
  firstName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 15,
  },
  lastName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 15,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(email) {
        return /^[a-zA-Z]{2,10}[0-9]{0,5}(@)(gmail|yahoo|outlook|hotmail)(.com)$/.test(email);
      },
      message :(obj) => `${obj.value} is not a valid email address`
    }
  },
});

userSchema.pre('save', async function(next){
  let salt = await bcrypt.genSalt(10);
  let hashedPassword = await bcrypt.hash(this.password, salt);

  this.password = hashedPassword;
  next();
},{Collection: 'User'});

const usersModel = mongoose.model('User', userSchema);

module.exports = usersModel;