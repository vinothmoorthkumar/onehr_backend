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
    this.status = data.status;
}

exports.MediaSave = [
    // auth,
    helpers.fileupload('files', 'jpg|jpeg|png|gif'),
    body("name", "name must not be empty.").isLength({ min: 1 }).trim(),
    body('files', 'Please upload your file in Image').exists(),
    body("page", "page must not be empty.").isLength({ min: 1 }).trim(),
    // body("section", "Section must not be empty.").isLength({ min: 1 }).trim(),
    (req, res) => {
        try {
            const errors = validationResult(req);
            console.log(req.body.fileSize);
            console.log(req.files);

            let file = req.files[0]
            var media = {
                name: req.body.name,
                page: req.body.page,
                section: req.body.section,
                link: req.body.link,
                fileName: file.filename,
                fileOriginalName: file.originalname,
                filePath: '/media/' + file.filename,
                fileSize: file.size,
                fileType: file.mimetype,
                status: 1
            };

            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }
            else {

                if (req.body.fileSize == 'single') {
                    Media.findOneAndUpdate({ page: req.body.page }, media).then((mediaData) => {
                        apiResponse.successResponseWithData(res, "Media add Success.", mediaData);
                    });
                } else {
                    return saveData()
                }

                function saveData() {
                    //Save media.
                    return Media.collection.insert(media, function (err) {
                        if (err) { return apiResponse.ErrorResponse(res, err); }
                        let mediaData = new MediaData(media);
                        return apiResponse.successResponseWithData(res, "Media add Success.", mediaData);
                    });
                }

            }
        } catch (err) {
            //throw error in json response with status 500. 
            console.log('err', err)
            return apiResponse.ErrorResponse(res, err);
        }
    }
];

exports.MediaList = [
    auth,
    function (req, res) {
        try {
            let skip = parseInt(req.query.skip) || 0;
            let limit = parseInt(req.query.limit) || 10;
            let sort = {};
            sort[req.query.sortby] = req.query.order == "true" ? 1 : -1;
            let query = { status: 1 }
            if (req.query.search) {
                query['name'] = { $regex: req.query.search, $options: "i" }
            }

            Media.find(query).skip(skip).limit(limit).sort(sort).then((medias) => {
                if (medias.length > 0) {
                    Media.find(query).countDocuments().then((count) => {
                        return apiResponse.successResponseWithData(res, "Operation success", { total: count, result: medias });
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

exports.MediaDetail = [
    auth,
    function (req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return apiResponse.successResponseWithData(res, "Operation success", {});
        }
        try {
            Media.findOne({ _id: req.params.id }).then((media) => {
                if (media !== null) {
                    let mediaData = new MediaData(media);
                    return apiResponse.successResponseWithData(res, "Operation success", mediaData);
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

exports.MediaUpdate = [
    auth,
    helpers.fileupload('files', 'jpg|jpeg|png|gif'),
    body("name", "name must not be empty.").isLength({ min: 1 }).trim(),
    body("page", "page must not be empty.").isLength({ min: 1 }).trim(),
    (req, res) => {
        try {
            const errors = validationResult(req);

            var media = {
                name: req.body.name,
                page: req.body.page,
                section: req.body.section,
                link: req.body.link,
                _id: req.params.id
            }

            if (req.files && req.files[0]) {
                let file = req.files[0];
                media['fileName'] = file.filename;
                media['fileOriginalName'] = file.originalname;
                media['filePath'] = '/media/' + file.filename;
                media['fileSize'] = file.size;
                media['fileType'] = file.mimetype;
            }
            console.log('media',media);
            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }
            else {
                if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                    return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
                } else {
                    Media.findById(req.params.id, function (err, foundMedia) {
                        if (foundMedia === null) {
                            return apiResponse.notFoundResponse(res, "Media not exists with this id");
                        } else {
                            //update media.

                            Media.findByIdAndUpdate(req.params.id, media, {}, function (err) {
                                if (err) {
                                    return apiResponse.ErrorResponse(res, err);
                                } else {
                                    let mediaData = new MediaData(media);
                                    return apiResponse.successResponseWithData(res, "Media update Success.", mediaData);
                                }
                            });

                        }
                    });
                }
            }
        } catch (err) {
            console.log('test2',err)
            //throw error in json response with status 500. 
            return apiResponse.ErrorResponse(res, err);
        }
    }
];


exports.MediaDelete = [
    auth,
    function (req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
        }
        try {
            Media.findById(req.params.id, function (err, foundMedia) {
                if (foundMedia === null) {
                    return apiResponse.notFoundResponse(res, "Media not exists with this id");
                } else {
                    //delete Media.
                    Media.findByIdAndUpdate(req.params.id, { status: 0 }, {}, function (err) {
                        if (err) {
                            return apiResponse.ErrorResponse(res, err);
                        } else {
                            return apiResponse.successResponse(res, "Media delete Success.");
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