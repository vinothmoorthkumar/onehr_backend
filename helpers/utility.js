const bcrypt = require("bcrypt");
const multer = require('multer');
const path = require('path');
const apiResponse = require("../helpers/apiResponse");
var fs = require('fs');

exports.randomNumber = function (length) {
	var text = "";
	var possible = "123456789";
	for (var i = 0; i < length; i++) {
		var sup = Math.floor(Math.random() * possible.length);
		text += i > 0 && sup == i ? "0" : possible.charAt(sup);
	}
	return Number(text);
};

exports.bcrypthash = function (password, callback) {
	bcrypt.hash(password, 10, function (err, hash) {
		callback(err, hash);
	})
}


exports.fileupload = function (file, allow, temp) {
	var storage = multer.diskStorage({
		destination: function (req, file, callback) {
			// let path = temp ? './temp' : './media';
			callback(null, './media');
		},
		filename: function (req, file, callback) {
			callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
		}
	});

	return multer({
		storage: storage,
		fileFilter: function (req, file, callback) {
			var ext = path.extname(file.originalname);
			// if (!ext.match(`\.(${allow})$`)) {
			// 	return callback(new Error('Only images are allowed'))
			// }
			callback(null, true)
		},
	}).array(file, 20);

}


exports.move = function (oldPath, newPath, callback) {

    fs.rename(oldPath, newPath, function (err) {
        if (err) {
            if (err.code === 'EXDEV') {
                copy();
            } else {
                callback(err);
            }
            return;
        }
        callback();
    });

    // function copy() {
    //     var readStream = fs.createReadStream(oldPath);
    //     var writeStream = fs.createWriteStream(newPath);

    //     readStream.on('error', callback);
    //     writeStream.on('error', callback);

    //     readStream.on('close', function () {
    //         fs.unlink(oldPath, callback);
    //     });

    //     readStream.pipe(writeStream);
    // }
}

