const User = require("../models/UserModel");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const auth = require("../middlewares/jwt");
const utility = require("../helpers/utility");

// User Schema
function UserData(data) {
    this.name = data.name;
    this.username = data.username;
    this.superadmin = data.superadmin;
    this.email = data.email;
    this.status = data.status;
    this.role = data.role;
    this.createdAt = data.createdAt;
}

exports.UserSave = [
    auth,
    body("email", "name must not be empty.").isLength({ min: 1 }).trim(),
    body("name", "name must not be empty.").isLength({ min: 1 }).trim(),
    body("password", "name must not be empty.").isLength({ min: 1 }).trim(),
    body("role", "name must not be empty.").isLength({ min: 1 }).trim(),
    body("username", "name must not be empty.").isLength({ min: 1 }).trim(),
    (req, res) => {
        try {
            const errors = validationResult(req);
            User.findOne({ username: req.body.username, status:1 }).then((user) => {
                if (!user) {
                    utility.bcrypthash(req.body.password, function (err, hash) {
                        var user = new User(
                            {
                                name: req.body.name,
                                email: req.body.email,
                                password: hash,
                                role: req.body.role,
                                username: req.body.username,
                            });
                        if (!errors.isEmpty()) {
                            return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
                        }
                        else {
                            //Save user.
                            user.save(function (err) {
                                if (err) { return apiResponse.ErrorResponse(res, err); }
                                let userData = new UserData(user);
                                return apiResponse.successResponseWithData(res, "User add Success.", userData);
                            });
                        }
                    })
        
                } else {
                    return apiResponse.validationErrorWithData(res, "Invalid Error.", "Username already exist");
                }
            });
      
        } catch (err) {
            //throw error in json response with status 500. 
            return apiResponse.ErrorResponse(res, err);
        }
    }
];

exports.UserList = [
    auth,
    function (req, res) {
        try {
            let skip = parseInt(req.query.skip) || 0;
            let limit = parseInt(req.query.limit) || 10;
            let sort={};
            sort[req.query.sortby]=req.query.order=="true"?1:-1;
            let query={ status: true }
            if(req.query.search){
                query['username'] = {$regex: req.query.search, $options:"i"}
            }

            User.find(query).skip(skip).limit(limit).sort(sort).then((users) => {
                if (users.length > 0) {
                    User.find(query).countDocuments().then((count) => {
                        return apiResponse.successResponseWithData(res, "Operation success", { total: count, result: users });
                    });
                } else {
                    return apiResponse.successResponseWithData(res, "Operation success", { total: 0, result: [] });
                }
            });
        } catch (err) {
            //throw error in json response with status 500. 
            return apiResponse.ErrorResponse(res, err);
        }
    }
];

exports.UserDetail = [
    auth,
    function (req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return apiResponse.successResponseWithData(res, "Operation success", {});
        }
        try {
            User.findOne({ _id: req.params.id }).then((user) => {
                if (user !== null) {
                    let userData = new UserData(user);
                    return apiResponse.successResponseWithData(res, "Operation success", userData);
                } else {
                    return apiResponse.successResponseWithData(res, "Operation success", {});
                }
            });
        } catch (err) {
            //throw error in json response with status 500. 
            return apiResponse.ErrorResponse(res, err);
        }
    }
];

exports.UserUpdate = [
    auth,
    body("email", "name must not be empty.").isLength({ min: 1 }).trim(),
    body("name", "name must not be empty.").isLength({ min: 1 }).trim(),
    body("role", "name must not be empty.").isLength({ min: 1 }).trim(),
    (req, res) => {
        try {
            let obj={
                name: req.body.name,
                email: req.body.email,
                role: req.body.role,
                _id: req.params.id
            }
            if(req.body.password){
                utility.bcrypthash(req.body.password, function (err, hash) {
                    obj.password=hash;
                    update();
                })
            }else{
                update();
            }
            function update() {
                const errors = validationResult(req);

                var user = new User(obj);
                if (!errors.isEmpty()) {
                    return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
                }
                else {
                    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                        return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
                    } else {
                        User.findById(req.params.id, function (err, foundUser) {
                            if (foundUser === null) {
                                return apiResponse.notFoundResponse(res, "User not exists with this id");
                            } else {
                                //update user.

                                User.findByIdAndUpdate(req.params.id, user, {}, function (err) {
                                    if (err) {
                                        return apiResponse.ErrorResponse(res, err);
                                    } else {
                                        let userData = new UserData(user);
                                        return apiResponse.successResponseWithData(res, "User update Success.", userData);
                                    }
                                });

                            }
                        });
                    }
                }
            }
        } catch (err) {
            //throw error in json response with status 500. 
            return apiResponse.ErrorResponse(res, err);
        }
    }
];


exports.UserDelete = [
    auth,
    function (req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
        }
        try {
            User.findById(req.params.id, function (err, foundUser) {
                if (foundUser === null) {
                    return apiResponse.notFoundResponse(res, "User not exists with this id");
                } else {
                    //delete User.
                    User.findByIdAndUpdate(req.params.id, { status: false }, {}, function (err) {
                        if (err) {
                            return apiResponse.ErrorResponse(res, err);
                        } else {
                            return apiResponse.successResponse(res, "User delete Success.");
                        }
                    });

                }
            });
        } catch (err) {
            //throw error in json response with status 500. 
            return apiResponse.ErrorResponse(res, err);
        }
    }
];