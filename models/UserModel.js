var mongoose = require("mongoose"),
 Schema = mongoose.Schema;

var UserSchema = new mongoose.Schema({
	name: {type: String, required: true},
	username: {type: String, required: true},
	superadmin: {type: Boolean},
	email: {type: String, required: true},
	password: {type: String, required: true},
	status: {type: Boolean, required: true, default: 1},
	role: { type: Schema.Types.ObjectId, ref: 'Role' }
}, {timestamps: true});

// Virtual for user's full name
UserSchema
	.virtual("fullName")
	.get(function () {
		return this.firstName + " " + this.lastName;
	});

module.exports = mongoose.model("User", UserSchema);