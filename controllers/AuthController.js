const UserModel = require("../models/UserModel");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailer = require("../helpers/mailer");
const { constants } = require("../helpers/constants");
const auth = require("../middlewares/jwt");

/**
 * User registration.
 *
 * @param {string}      firstName
 * @param {string}      lastName
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.register = [
	// Validate fields.
	body("firstName").isLength({ min: 1 }).trim().withMessage("First name must be specified.")
		.isAlphanumeric().withMessage("First name has non-alphanumeric characters."),
	body("lastName").isLength({ min: 1 }).trim().withMessage("Last name must be specified.")
		.isAlphanumeric().withMessage("Last name has non-alphanumeric characters."),
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address.").custom((value) => {
			return UserModel.findOne({ email: value }).then((user) => {
				if (user) {
					return Promise.reject("E-mail already in use");
				}
			});
		}),
	body("password").isLength({ min: 6 }).trim().withMessage("Password must be 6 characters or greater."),
	// Sanitize fields.
	sanitizeBody("firstName").escape(),
	sanitizeBody("lastName").escape(),
	sanitizeBody("email").escape(),
	sanitizeBody("password").escape(),
	// Process request after validation and sanitization.
	(req, res) => {
		try {
			// Extract the validation errors from a request.
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Display sanitized values/errors messages.
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				//hash input password
				utility.bcrypthash(req.body.password, function (err, hash) {
					// generate OTP for confirmation
					let otp = utility.randomNumber(4);
					// Create User object with escaped and trimmed data
					var user = new UserModel(
						{
							firstName: req.body.firstName,
							lastName: req.body.lastName,
							email: req.body.email,
							password: hash,
							confirmOTP: otp
						}
					);
					// Html email body
					let html = "<p>Please Confirm your Account.</p><p>OTP: " + otp + "</p>";
					// Send confirmation email
					mailer.send(
						constants.confirmEmails.from,
						req.body.email,
						"Confirm Account",
						html
					).then(function () {
						// Save user.
						user.save(function (err) {
							if (err) { return apiResponse.ErrorResponse(res, err); }
							let userData = {
								_id: user._id,
								firstName: user.firstName,
								lastName: user.lastName,
								email: user.email
							};
							return apiResponse.successResponseWithData(res, "Registration Success.", userData);
						});
					}).catch(err => {
						return apiResponse.ErrorResponse(res, err);
					});
				});
			}
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}];

/**
 * User login.
 *
 * @param {string}      username
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.login = [
	body("username").isLength({ min: 1 }).trim().withMessage("Username must be specified.")
		.withMessage("Username must be a valid email address."),
	body("password").isLength({ min: 1 }).trim().withMessage("Password must be specified."),
	sanitizeBody("username").escape(),
	sanitizeBody("password").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				UserModel.findOne({ username: req.body.username }).populate('role').then(user => {
					if (user) {
						//Compare given password with db's hash.
						bcrypt.compare(req.body.password, user.password, function (err, same) {
							if (same) {
								let acl = []
								if (user.role && user.role.acl) {
									user.role.acl.forEach((element, i) => {
										let permission = [];
										element.permission.forEach(obj => {
											if (obj.selected) {
												permission.push(obj.key)
											}
										});
										acl.push({
											module: element.module,
											name: element.name,
											permission
										})
									});
								}

								if (user.role && user.role.page) {
									for (const property in user.role.page) {
										user.role.page[property] = user.role.page[property].map(ele => ele.slug)
									}
								}
								// Check User's account active or not.
								if (user.status) {
									let userData = {
										_id: user._id,
										name: user.name,
										username: user.username,
										superadmin: user.superadmin || false,
										email: user.email,
										role: user.role ? user.role.name : 'superadmin',
										permission: acl,
									};
									if (user.role && user.role.page) {
										userData['pagePermission'] = user.role.page

									}
									//Prepare JWT token for authentication
									const jwtPayload = userData;
									const jwtData = {
										expiresIn: process.env.JWT_TIMEOUT_DURATION,
									};
									const secret = process.env.JWT_SECRET;
									//Generated JWT token with Payload and secret.
									userData.token = jwt.sign(jwtPayload, secret, jwtData);
									return apiResponse.successResponseWithData(res, "Login Success.", userData);
								} else {
									return apiResponse.unauthorizedResponse(res, "Account is not active. Please contact admin.");
								}

							} else {
								return apiResponse.unauthorizedResponse(res, "Username or Password wrong.");
							}
						});
					} else {
						return apiResponse.unauthorizedResponse(res, "Username or Password wrong.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];

/**
 * Verify Confirm otp.
 *
 * @param {string}      email
 * @param {string}      otp
 *
 * @returns {Object}
 */
exports.verifyConfirm = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	body("otp").isLength({ min: 1 }).trim().withMessage("OTP must be specified."),
	sanitizeBody("email").escape(),
	sanitizeBody("otp").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				var query = { email: req.body.email };
				UserModel.findOne(query).then(user => {
					if (user) {
						//Check already confirm or not.
						if (!user.isConfirmed) {
							//Check account confirmation.
							if (user.confirmOTP == req.body.otp) {
								//Update user as confirmed
								UserModel.findOneAndUpdate(query, {
									isConfirmed: 1,
									confirmOTP: null
								}).catch(err => {
									return apiResponse.ErrorResponse(res, err);
								});
								return apiResponse.successResponse(res, "Account confirmed success.");
							} else {
								return apiResponse.unauthorizedResponse(res, "Otp does not match");
							}
						} else {
							return apiResponse.unauthorizedResponse(res, "Account already confirmed.");
						}
					} else {
						return apiResponse.unauthorizedResponse(res, "Specified email not found.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];

/**
 * Resend Confirm otp.
 *
 * @param {string}      email
 *
 * @returns {Object}
 */
exports.resendConfirmOtp = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	sanitizeBody("email").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				var query = { email: req.body.email };
				UserModel.findOne(query).then(user => {
					if (user) {
						//Check already confirm or not.
						if (!user.isConfirmed) {
							// Generate otp
							let otp = utility.randomNumber(4);
							// Html email body
							let html = "<p>Please Confirm your Account.</p><p>OTP: " + otp + "</p>";
							// Send confirmation email
							mailer.send(
								constants.confirmEmails.from,
								req.body.email,
								"Confirm Account",
								html
							).then(function () {
								user.isConfirmed = 0;
								user.confirmOTP = otp;
								// Save user.
								user.save(function (err) {
									if (err) { return apiResponse.ErrorResponse(res, err); }
									return apiResponse.successResponse(res, "Confirm otp sent.");
								});
							});
						} else {
							return apiResponse.unauthorizedResponse(res, "Account already confirmed.");
						}
					} else {
						return apiResponse.unauthorizedResponse(res, "Specified email not found.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];

exports.changePassword = [
	auth,
	body("id", "id must not be empty.").isLength({ min: 1 }).trim(),
	body("oldpassword", "oldpassword must not be empty.").isLength({ min: 1 }).trim(),
	body("password", "password must not be empty.").isLength({ min: 1 }).trim(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				var query = { _id: req.body.id };
				UserModel.findOne(query).then(user => {
					if (user) {
						bcrypt.compare(req.body.oldpassword, user.password, function (err, same) {
							if (same) {
								utility.bcrypthash(req.body.password, function (err, hash) {
									if (!err) {
										UserModel.findOneAndUpdate(query, {
											password: hash,
										}).then(response => {
											return apiResponse.successResponse(res, "Password updated successfully");
										});
									} else {
										return apiResponse.ErrorResponse(res, err);
									}
								})
							} else {
								return apiResponse.ErrorResponse(res, "Old password is not matching.");
							}
						})
					} else {
						return apiResponse.unauthorizedResponse(res, "Specified email not found.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
]