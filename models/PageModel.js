var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var PageSchema = new Schema({
	name: {type: String, required: true},
    html: {type: String, required: true},
    slug: {type: String, required: true},
    status: {type: Boolean, required: true, default: 1}
}, {timestamps: true});

module.exports = mongoose.model("Page", PageSchema);