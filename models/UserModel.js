var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
	username: {type: String, required: true},
	superadmin: {type: Boolean},
	email: {type: String, required: true},
	password: {type: String, required: true},
	status: {type: Boolean, required: true, default: 1}
}, {timestamps: true});

// Virtual for user's full name
UserSchema
	.virtual("fullName")
	.get(function () {
		return this.firstName + " " + this.lastName;
	});

module.exports = mongoose.model("User", UserSchema);