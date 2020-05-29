const Page = require("../models/PageModel");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const auth = require("../middlewares/jwt");
const utility = require("../helpers/utility");

// Page Schema
function PageData(data) {
    this.name = data.name;
    this.slug = data.slug;
    this.html = data.html;
    this.status = data.status;
    this.createdAt = data.createdAt;
}

exports.PageDetail = [
    auth,
    function (req, res) {
        try {
            Page.findOne({ slug: req.params.slug }).then((page) => {
                if (page !== null) {
                    let pageData = new PageData(page);
                    return apiResponse.successResponseWithData(res, "Operation success", pageData);
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

exports.PageUpdate = [
    auth,
    body("name", "name must not be empty.").isLength({ min: 1 }).trim(),
    body("html", "name must not be empty.").exists(),
    (req, res) => {
        try {
            const errors = validationResult(req);
            var page =   {
                name: req.body.name,
                html: req.body.html,
                slug: req.params.slug
            }
            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }
            else {
                //update page.
                Page.updateOne({ slug: req.params.slug }, page, { upsert: true }, function (err) {
                    if (err) {
                        return apiResponse.ErrorResponse(res, err);
                    } else {
                        let pageData = new PageData(page);
                        return apiResponse.successResponseWithData(res, "Page update Success.", pageData);
                    }
                });
            }
        } catch (err) {
            //throw error in json response with status 500. 
            return apiResponse.ErrorResponse(res, err);
        }
    }
];

