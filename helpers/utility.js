const bcrypt = require("bcrypt");
const multer = require('multer');
const path = require('path');
exports.randomNumber = function (length) {
	var text = "";
	var possible = "123456789";
	for (var i = 0; i < length; i++) {
		var sup = Math.floor(Math.random() * possible.length);
		text += i > 0 && sup == i ? "0" : possible.charAt(sup);
	}
	return Number(text);
};

exports.bcrypthash= function(password,callback){
	bcrypt.hash(password,10,function(err, hash) {
		callback(err,hash);
	})
}


exports.fileupload= function(file){

	var storage = multer.diskStorage({
		destination: function (req, file, callback) {
		  callback(null, './media');
		},
		filename: function (req, file, callback) {
		  callback(null, file.fieldname + '-' + Date.now()+path.extname(file.originalname));
		}
	  });
	  
	  return multer({ storage : storage }).array(file,20);
	  
}

