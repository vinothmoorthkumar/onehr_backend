var mongoose = require("mongoose"),
 Schema = mongoose.Schema;

var MediaSchema = new mongoose.Schema({
	name: {type: String, required: true},
    page: {type: String, required: true},
    section: {type: String, required: true},
    link: {type: String, required: true},
    fileName: {type: String, required: true},
    fileOriginalName: {type: String, required: true},
    fileType: {type: String, required: true},
    filePath: {type: String, required: true},
    fileSize: {type: Number, required: true},
	status: {type: Number, required: true, default: 1},
}, {timestamps: true});

module.exports = mongoose.model("Media", MediaSchema);