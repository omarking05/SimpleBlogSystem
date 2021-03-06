/**
* UserController
*
* @description :: Server-side logic for managing users
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/

module.exports = {

	upload_file: function(req, res) {
		var fs = require('fs');
		console.log(req.files);

		fs.readFile(req.files.upload.path, function(err, data) {
			var newPath = 'assets/files/' + req.files.upload.name;
			fs.writeFile(newPath, data, function(err) {
				if (err) res.view({ err: err });
				html = "";
				html += "<script type='text/javascript'>";
				html += "    var funcNum = " + req.query.CKEditorFuncNum + ";";
				html += "    var url     = \"/files/" + req.files.upload.name + "\";";
				html += "    var message = \"Uploaded file successfully\";";
				html += "";
				html += "    window.parent.CKEDITOR.tools.callFunction(funcNum, url, message);";
				html += "</script>";

				res.send(html);
			});

		});
	},

	// ----------------------------------------------------- GETTERS

	/*
	// Parameters ()
	// returns Json object that carry:
	// 	- error: 			true 		=> 	(There is an error occurred)
	// 							false		=>		(No error occurred)
	// 	- message:			Error message or Success message to be shown to the end user
	// 	- users object: 	carry all the info of all users in DB
	*/
	getAll_Users: function(req, res) {
		if (req.isAuthenticated()) {
			User.find({ sort: 'createdAt DESC' }).exec(function(err, data) {
				if (err) {
					console.log('-User.All ERROR:', err);
					res.view('errors/error', {
						error: 'true',
						message: err
					});
				} else {
					res.view('panel/users', {
						error: 'false',
						data: data
					});
				}
			});
		} else {
			console.log('-GENERAL ERROR!!, USER IS NOT AUTHENTICATED');
			res.view('auth/login', {
				error: 'true',
				message: 'Please login to your account',
				url: 'panel/users'
			});
		}
	},

	/*
	// Parameters (query/type)
	// returns Json object that carry:
	// 	- error: 			true 		=> 	(There is an error occurred)
	// 							false		=>		(No error occurred)
	// 	- message:			Error message or Success message to be shown to the end user
	// 	- url: 				URL user should go back to
	// 	- users object: 	carry all the info of all query matched users in DB
	*/
	getUser_ByQuery: function(req, res) {

		if (req.isAuthenticated()) {
			if (req.param('query') || req.param('type')) {

				var query = req.param('query') ? req.param('query') : undefined;
				var type = req.param('type');

				if (type !== 'name' && type !== 'email') {
					type = 'name'; //Search by user name by default
				}

				var searchParam = {};
				var searchHelper = {};
				var fuckJS = {};
				var strContains = "contains";

				fuckJS[strContains] = query;
				searchParam[type] = fuckJS;
				searchParam['sort'] = 'createdAt DESC';

				User.find(searchParam).exec(function(err, data) {
					if (err) {
						console.log('-User.ByQuery ERROR:', err);
						res.view('errors/error', {
							error: 'true',
							message: err,
							url: 'panel/users'
						});
					} else {
						res.view('panel/users', {
							error: 'false',
							data: data,
							url: 'panel/users'
						});
					}
				});

			} else {
				console.log('-User.ByQuery ERROR: No parameters were found');
				res.view('errors/error', {
					error: 'true',
					message: 'Missing parameters, those were sent are:' + req.allParams(),
					url: 'panel/users'
				});
			}
		} else {
			console.log('-GENERAL ERROR!!, USER IS NOT AUTHENTICATED');
			res.view('auth/login', {
				error: 'true',
				message: 'Please login to your account',
				url: 'panel/users'
			});
		}

	},

	// ----------------------------------------------------- GETTERS


	// ----------------------------------------------------- SETTERS

	/*
	// Parameters ({name,email,password})
	// returns Json object that carry:
	// 	- error: 			true 		=> 	(There is an error occurred)
	// 							false		=>		(No error occurred)
	// 	- message:			Error message or Success message to be shown to the end user
	// 	- url: 				URL user should go back to
	// 	- user object: 	carry all the info of user in action
	*/
	addUser: function(req, res) {

		if (req.method === 'GET') {
			console.log('-GENERAL ERROR!!, You are not allowed here');
			res.view('homepage', {
				message: 'You requested wrong page',
				url: 'panel/users/addUser'
			});
		}

		// if (req.isAuthenticated()) {

		if (req.param('name') && req.param('email') && req.param('password')) {

			var name = req.param('name');
			var email = req.param('email');
			var password = req.param('password');

			var userModel = {
				name: name,
				email: email,
				password: password
			}

			User.create(userModel, function(err, data) {
				if (err) {
					console.log('-User.Create ERROR', err);
					res.view('errors/error', {
						error: 'true',
						message: err,
						url: 'panel/users/addUser'
					});
				} else {
					res.view('success/success', {
						error: 'false',
						message: "User added successfully",
						url: 'panel/users/addUser',
						user: data
					});
				}
			})

		} else {
			console.log('-GENERAL ERROR!!, MISSING IMPORTANT CREDINTIALS');
			res.view('errors/error', {
				error: 'true',
				message: 'Missing parameters, those were sent are:' + req.allParams(),
				url: 'panel/users/addUser'
			});

		}

		// } else {
		//     console.log('-GENERAL ERROR!!, USER IS NOT AUTHENTICATED');
		//     res.view('user/login', {
		//         error: 'true',
		//         message: 'Please login to add a new article',
		//         url: 'panel/users/addUser'
		//     });
		// }
	},

	/*
	// Parameters (name/email/password, id)
	// returns Json object that carry:
	// 	- error: 			true 		=> 	(There is an error occurred)
	// 							false		=>		(No error occurred)
	// 	- message:			Error message or Success message to be shown to the end user
	// 	- id:					User Id ONLY IF there is an error for developing issues
	// 	- url: 				URL user should go back to
	// 	- user object: 	carry all the info of user in action
	*/
	editUser: function(req, res) {

		if (req.method === 'GET') {
			console.log('-GENERAL ERROR!!, You are not allowed here');
			res.view('homepage', {
				error: 'true',
				message: 'You requested wrong page',
				url: 'panel/users/editUser'
			});
		}

		if (req.isAuthenticated()) {
			if (req.param('name') && req.param('value') && req.param('pk')) {

				if (req.param('name') === 'name') {
					var name = req.param('value');

					User.update({ id: req.param('pk') }, { name: name }).exec(function(err, user) {
						if (err) {
							console.log('-User.Edit ERROR', err);
							res.view('errors/error', {
								error: 'true',
								message: err,
								id: req.param('pk'),
								url: 'panel/user/editUser'
							});
						} else {
							User.find({ sort: 'createdAt DESC' }).limit(1).exec(function(err, data) {
								if (err) {
									console.log('-User.All ERROR:', err);
									res.view('errors/error', {
										error: 'true',
										message: err
									});
								} else {
									delete user[0].password;
									user = user[0];
									req.session.user = user;
									res.view('panel/users', {
										error: 'false',
										message: "name edited successfully",
										user: user,
										url: 'panel/users',
										data: data
									});
								}
							});

						}
					});

				} else if (req.param('name') === 'email') {
					var email = req.param('value');

					User.update({ id: req.param('pk') }, { email: email }).exec(function(err, user) {
						if (err) {
							console.log('-User.Edit ERROR', err);
							res.view('errors/error', {
								error: 'true',
								message: err,
								id: req.param('pk'),
								url: 'panel/user/editUser'
							});
						} else {
							User.find({ sort: 'createdAt DESC' }).exec(function(err, data) {
								if (err) {
									console.log('-User.All ERROR:', err);
									res.view('errors/error', {
										error: 'true',
										message: err
									});
								} else {
									delete user[0].password;
									user = user[0];
									req.session.user = user;
									res.view('panel/users', {
										error: 'false',
										message: "Email edited successfully",
										user: user,
										url: 'panel/users',
										data: data
									});
								}
							});
						}
					});

				} else if (req.param('password') && req.param('id')) {
					var password = req.param('password');

					User.update({ id: req.param('id') }, { password: password }).exec(function(err, user) {
						if (err) {
							console.log('-User.Edit ERROR', err);
							res.view('errors/error', {
								error: 'true',
								message: err,
								id: req.param('id'),
								url: 'panel/users'
							});
						} else {
							User.find({ sort: 'createdAt DESC' }).exec(function(err, data) {
								if (err) {
									console.log('-User.All ERROR:', err);
									res.view('errors/error', {
										error: 'true',
										message: err
									});
								} else {
									delete user[0].password;
									user = user[0];
									req.session.user = user;
									res.view('panel/users', {
										error: 'false',
										message: "password edited successfully",
										user: user,
										url: 'panel/users',
										data: data
									});
								}
							});
						}
					});

				} else {
					console.log('-User.Edit ERROR: No parameters were found', req.allParams());
					res.view('errors/error', {
						error: 'true',
						message: 'Missing parameters, those were sent are:' + req.allParams(),
						url: 'panel/user/editUser'
					});
				}

			} else {
				console.log('-User.Edit ERROR: No Specific parameter was found', req.allParams());
				res.view('errors/error', {
					error: 'true',
					message: 'Missing parameters, those were sent are:' + req.allParams(),
					url: 'panel/user/editUser'
				});
			}

		} else {
			console.log('-GENERAL ERROR!!, USER IS NOT AUTHENTICATED');
			res.view('user/login', {
				error: 'true',
				message: 'Please login to edit any user',
				url: 'panel/user/editUser'
			});
		}
	},

	/*
	// Parameters (id)
	// returns Json object that carry:
	// 	- error: 			true 		=> 	(There is an error occurred)
	// 							false		=>		(No error occurred)
	// 	- message:			Error message or Success message to be shown to the end user
	// 	- url: 				URL user should go back to
	*/
	removeUser: function(req, res) {

		if (req.isAuthenticated()) {
			User.destroy({ 'id': req.param('id') }).exec(function(err) {

				// console.log(req.headers);

				if (err) {
					console.log('-User.Delete ERROR', err);
					res.view('errors/error', {
						error: 'true',
						message: err,
						url: 'panel/users'
					});
				} else {
					User.find({ sort: 'createdAt DESC' }).exec(function(err, data) {
						if (err) {
							console.log('-User.All ERROR:', err);
							res.view('errors/error', {
								error: 'true',
								message: err
							});
						} else {

							// console.log(req.headers);

							res.view('panel/users', {
								error: 'false',
								message: 'User deleted successfully',
								url: 'panel/users',
								data: data
							});
						}
					});
				}
			});

		} else {
			console.log('-GENERAL ERROR!!, USER IS NOT AUTHENTICATED');
			res.view('user/login', {
				error: 'true',
				message: 'Please login to remove any article',
				url: 'panel/users'
			});
		}
	},

	// ----------------------------------------------------- SETTERS



};
