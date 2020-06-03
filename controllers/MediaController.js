const Media = require("../models/MediaModel");

const apiResponse = require("../helpers/apiResponse");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const auth = require("../middlewares/jwt");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const helpers = require("../helpers/utility");

// Media Schema
function MediaData(data) {
    this.name = data.name;
    this.page = data.page;
    this.section = data.section;
    this.link = data.link;
    this.fileName = data.fileName;
    this.fileOriginalName = data.fileOriginalName;
    this.filePath = data.filePath;
    this.fileType = data.fileType;
    this.fileSize = data.fileSize;
    this.createdAt = data.createdAt;
}

exports.MediaSave = [
    // auth,
    helpers.fileupload('files'),
    body("name", "name must not be empty.").isLength({ min: 1 }).trim(),
    // body('files', 'Please upload your file in PDF').exists(),
    body("page", "page must not be empty.").isLength({ min: 1 }).trim(),
    // body("section", "Section must not be empty.").isLength({ min: 1 }).trim(),
    (req, res) => {
        try {
            const errors = validationResult(req);
            console.log(req.body.name);
            console.log(req.files);

            var media = req.files.map(ele=>{
                return {
                    name: req.body.name,
                    page: req.body.page,
                    section: req.body.section,
                    link: req.body.link,
                    fileName: ele.filename,
                    fileOriginalName: ele.originalname,
                    filePath: '/media/' + ele.filename,
                    fileSize: ele.size,
                    fileType: ele.mimetype
                };
            })
            console.log('test', media)
            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }
            else {
                //Save media.
                Media.collection.insert(media,function (err) {
                    if (err) { return apiResponse.ErrorResponse(res, err); }
                    let mediaData = new MediaData(media);
                    return apiResponse.successResponseWithData(res, "Media add Success.", mediaData);
                });
            }




        } catch (err) {
            //throw error in json response with status 500. 
            console.log('err', err)
            return apiResponse.ErrorResponse(res, err);
        }
    }
];

// exports.RoleList = [
//     auth,
//     function (req, res) {
//         try {
//             let skip = parseInt(req.query.skip) || 0;
//             let limit = parseInt(req.query.limit) || 10;
//             let sort={};
//             sort[req.query.sortby]=req.query.order=="true"?1:-1;
//             let query={ status: true }
//             if(req.query.search){
//                 query['name'] = {$regex: req.query.search, $options:"i"}
//             }

//             Role.find(query).skip(skip).limit(limit).sort(sort).then((roles) => {
//                 if (roles.length > 0) {
//                     Role.find(query).countDocuments().then((count) => {
//                         return apiResponse.successResponseWithData(res, "Operation success", { total: count, result: roles });
//                     });
//                 } else {
//                     return apiResponse.successResponseWithData(res, "Operation success", { total: 0, result: [] });
//                 }
//             });
//         } catch (err) {
//             //throw error in json response with status 500. 
//             return apiResponse.ErrorResponse(res, err);
//         }
//     }
// ];

// exports.RoleDetail = [
//     auth,
//     function (req, res) {
//         if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//             return apiResponse.successResponseWithData(res, "Operation success", {});
//         }
//         try {
//             Role.findOne({ _id: req.params.id }).then((role) => {
//                 if (role !== null) {
//                     let roleData = new RoleData(role);
//                     return apiResponse.successResponseWithData(res, "Operation success", roleData);
//                 } else {
//                     return apiResponse.successResponseWithData(res, "Operation success", {});
//                 }
//             });
//         } catch (err) {
//             //throw error in json response with status 500. 
//             return apiResponse.ErrorResponse(res, err);
//         }
//     }
// ];

// exports.RoleUpdate = [
//     auth,
//     body("name", "name must not be empty.").isLength({ min: 1 }).trim(),
//     body("acl", "name must not be empty.").exists(),
//     (req, res) => {
//         try {
//             const errors = validationResult(req);
//             var role = new Role(
//                 {
//                     name: req.body.name,
//                     acl: req.body.acl,
//                     _id: req.params.id
//                 });
//             if (!errors.isEmpty()) {
//                 return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
//             }
//             else {
//                 if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//                     return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
//                 } else {
//                     Role.findById(req.params.id, function (err, foundRole) {
//                         if (foundRole === null) {
//                             return apiResponse.notFoundResponse(res, "Role not exists with this id");
//                         } else {
//                             //update role.

//                             Role.findByIdAndUpdate(req.params.id, role, {}, function (err) {
//                                 if (err) {
//                                     return apiResponse.ErrorResponse(res, err);
//                                 } else {
//                                     let roleData = new RoleData(role);
//                                     return apiResponse.successResponseWithData(res, "Role update Success.", roleData);
//                                 }
//                             });

//                         }
//                     });
//                 }
//             }
//         } catch (err) {
//             //throw error in json response with status 500. 
//             return apiResponse.ErrorResponse(res, err);
//         }
//     }
// ];


// exports.RoleDelete = [
//     auth,
//     function (req, res) {
//         if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//             return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
//         }
//         try {
//             Role.findById(req.params.id, function (err, foundRole) {
//                 if (foundRole === null) {
//                     return apiResponse.notFoundResponse(res, "Role not exists with this id");
//                 } else {
//                     //delete Role.
//                     Role.findByIdAndUpdate(req.params.id, { status: false }, {}, function (err) {
//                         if (err) {
//                             return apiResponse.ErrorResponse(res, err);
//                         } else {
//                             return apiResponse.successResponse(res, "Role delete Success.");
//                         }
//                     });

//                 }
//             });
//         } catch (err) {
//             //throw error in json response with status 500. 
//             return apiResponse.ErrorResponse(res, err);
//         }
//     }
// ];