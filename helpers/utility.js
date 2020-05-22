const bcrypt = require("bcrypt");

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

