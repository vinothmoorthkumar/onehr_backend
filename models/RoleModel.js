var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var RoleSchema = new Schema({
	name: {type: String, required: true},
    acl: {type: Array, required: true},
    status: {type: Boolean, required: true, default: 1}
}, {timestamps: true});

module.exports = mongoose.model("Role", RoleSchema);