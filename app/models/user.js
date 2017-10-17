var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var userSchema = new Schema({
	firstName: String,
	lastName: String,
	birthday: Date,
	creditcard: String,
	gender: String,
	email: String
});

// hash the creditcard
userSchema.methods.generateHash = function (creditcard) {
	return bcrypt.hashSync(creditcard, bcrypt.genSaltSync(8), null);
};

// checking if creditcard is valid
userSchema.methods.validCreditCard = function (creditcard) {
	return bcrypt.compareSync(creditcard, this.creditcard);
};
var User = mongoose.model('User', userSchema);
module.exports = User;