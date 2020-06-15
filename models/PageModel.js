var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var PageSchema = new Schema({
	name: {type: String, required: true},
    html: {type: Array, required: true},
    slug: {type: String, required: true},
    extras: {type: Object},
    status: {type: Boolean, required: true, default: 1}
}, {timestamps: true});

module.exports = mongoose.model("Page", PageSchema);