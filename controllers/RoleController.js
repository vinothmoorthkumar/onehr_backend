const Role = require("../models/RoleModel");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const auth = require("../middlewares/jwt");

// Role Schema
function RoleData(data) {
    this.name = data.name;
    this.acl = data.acl;
    this.createdAt = data.createdAt;
}

exports.RoleSave = [
    auth,
    body("name", "name must not be empty.").isLength({ min: 1 }).trim(),
    body("acl", "name must not be empty.").exists(),
    (req, res) => {
        try {
            const errors = validationResult(req);
            // let acl =[]
            // req.body.acl.forEach((element,i) => {
            //     let permission=[];
            //     element.permission.forEach(obj => {
            //         if(obj.selected){
            //             permission.push(obj.key)
            //         }
            //     });
            //     acl.push({
            //         module:element.module,
            //         name:element.name,
            //         permission
            //     })
            // });
            var role = new Role(
                {
                    name: req.body.name,
                    acl: req.body.acl,
                });

            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }
            else {
                //Save role.
                role.save(function (err) {
                    if (err) { return apiResponse.ErrorResponse(res, err); }
                    let roleData = new RoleData(role);
                    return apiResponse.successResponseWithData(res, "Role add Success.", roleData);
                });
            }
        } catch (err) {
            //throw error in json response with status 500. 
            console.log('err', err)
            return apiResponse.ErrorResponse(res, err);
        }
    }
];

exports.RoleList = [
    auth,
    function (req, res) {
        try {
            Role.find({ status: true }).then((roles) => {
                if (roles.length > 0) {
                    return apiResponse.successResponseWithData(res, "Operation success", roles);
                } else {
                    return apiResponse.successResponseWithData(res, "Operation success", []);
                }
            });
        } catch (err) {
            //throw error in json response with status 500. 
            return apiResponse.ErrorResponse(res, err);
        }
    }
];

exports.RoleDetail = [
    auth,
    function (req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return apiResponse.successResponseWithData(res, "Operation success", {});
        }
        try {
            Role.findOne({ _id: req.params.id }).then((role) => {
                if (role !== null) {
                    let roleData = new RoleData(role);
                    return apiResponse.successResponseWithData(res, "Operation success", roleData);
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

exports.RoleUpdate = [
    auth,
    body("name", "name must not be empty.").isLength({ min: 1 }).trim(),
    body("acl", "name must not be empty.").exists(),
    (req, res) => {
        try {
            const errors = validationResult(req);
            var role = new Role(
                {
                    name: req.body.name,
                    acl: req.body.acl,
                    _id: req.params.id
                });
            console.log('test', role)
            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }
            else {
                if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                    return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
                } else {
                    Role.findById(req.params.id, function (err, foundRole) {
                        if (foundRole === null) {
                            return apiResponse.notFoundResponse(res, "Role not exists with this id");
                        } else {
                            //update role.

                            Role.findByIdAndUpdate(req.params.id, role, {}, function (err) {
                                if (err) {
                                    return apiResponse.ErrorResponse(res, err);
                                } else {
                                    let roleData = new RoleData(role);
                                    return apiResponse.successResponseWithData(res, "Role update Success.", roleData);
                                }
                            });

                        }
                    });
                }
            }
        } catch (err) {
            //throw error in json response with status 500. 
            return apiResponse.ErrorResponse(res, err);
        }
    }
];


exports.RoleDelete = [
    auth,
    function (req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
        }
        try {
            Role.findById(req.params.id, function (err, foundRole) {
                if (foundRole === null) {
                    return apiResponse.notFoundResponse(res, "Role not exists with this id");
                } else {
                    //delete Role.
                    Role.findByIdAndUpdate(req.params.id, { status: false }, {}, function (err) {
                        if (err) {
                            return apiResponse.ErrorResponse(res, err);
                        } else {
                            return apiResponse.successResponse(res, "Role delete Success.");
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