var express = require("express");
var router = express.Router();
const apiResponse = require("../helpers/apiResponse");

const Page = require("../models/PageModel");

function PageData(data) {
    this.name = data.name;
    this.slug = data.slug;
    this.html = data.html;
}

/* GET home page. */
router.get("/", function(req, res) {
	res.render("index", { title: "Express" });
});

router.get("/site/:slug", function(req, res) {
	try {
		console.log('slug',req.params.slug);
		Page.findOne({slug: req.params.slug}).then((page) => {
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
});

module.exports = router;
