/*
 * Request handlers related tasks
 *
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

// Instantiate handlers object
const handlers = {};


/*---- users handler ----*/

handlers.users = function(data, callback) {
	const acceptableMethods = ['post','get','put','delete']

	if(acceptableMethods.indexOf(data.method) > -1 ) {
		handlers._users[data.method](data, callback);
	} else {
		callback(405);
	}
}

// Container for user submethods
handlers._users = {};

// Users - post
// Required data: name, email, street address, password, tosAgreement
// Optional data: none
handlers._users.post = function(data, callback){
	// Check if all fields are as required
	const name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false;
	const email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 && data.payload.email.trim().match('@').length == 1 && data.payload.email.trim().match('.').length >= 1 && data.payload.email.trim().match(new RegExp(/\w+@\w+\.\w+/g)) !== null ? data.payload.email.trim() : false;
	const streetAddress = typeof(data.payload.streetAddress) == 'string' && data.payload.streetAddress.trim().length > 0 && data.payload.streetAddress.trim().match(new RegExp(/\d+/g)) ? data.payload.streetAddress.trim() : false;
	const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
	const tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;
	
	// Used user type in order to seperate simple users from admin users (@WIP, I don't know if this is a good practice. Trying to apply very simple access levels logic)
	const type = typeof(data.payload.type) == 'string' && ['admin', 'user'].indexOf(data.payload.type) > -1 ? data.payload.type : false;

	if(name && email && streetAddress && password && tosAgreement && type) {
		// Check that user is not already created
		_data.read('users', email, function(err, data){
			if(err) {

				// Hash password
				const hashedPassword = helpers.hash(password);

				if(hashedPassword) {
					// create user object
					const userObject = {
						'name': name,
						'email': email,
						'streetAddress': streetAddress,
						'hashedPassword': hashedPassword,
						'tosAgreement': tosAgreement,
						'type': type
					};

					// Store user object as userEmail.json file
					_data.create('users', email, userObject, function(err){
						if(!err) {
							callback(200);
						} else {
							callback(500, {'Error': 'Could not create user'});
						}
					});
				}

			} else {
				callback(400, {'Error':'User with that email already exists'});
			}
		});
	} else {
		callback(400, {'Error':'Missing required fields'});
	}

};

// Users - get
// Required fields: email
// Optional fields: none
handlers._users.get = function(data, callback){
	// Check that the provided email is valid
	const email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 && data.queryStringObject.email.trim().match('@').length == 1 &&  data.queryStringObject.email.trim().match('.').length >= 1 && data.queryStringObject.email.trim().match(new RegExp(/\w+@\w+\.\w+/g)) !== null ? data.queryStringObject.email.trim() : false; 

	if(email){

		const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
		// Verify that user has access to GET his data
		handlers._tokens.verifyToken(token, email, function(tokenIsValid){
			if(tokenIsValid){

				// Lookup the user
				_data.read('users', email, function(err, data){
					if(!err && data) {
						// Remove hashedPassword from object to be shown
						delete data.hashedPassword;
						// Remove user type from object to be shown
						delete data.type;
						callback(200, data);
					} else {
						callback(404);
					}
				});

			} else {
				callback(403, {'Error':'Missing token or token is invalid'});
			}
		});

	} else {
		callback(400, {'Error':'Missing required field'});
	}

};

// Users - put
// Required fields: email && at least one of the optional fields bellow
// Optional fields: name, streetAddress, password
handlers._users.put = function(data, callback){
	const email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 && data.payload.email.trim().match('@').length == 1 && data.payload.email.trim().match('.').length >= 1 && data.payload.email.trim().match(new RegExp(/\w+@\w+\.\w+/g)) != null ? data.payload.email.trim() : false;
	const name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false;
	const streetAddress = typeof(data.payload.streetAddress) == 'string' && data.payload.streetAddress.trim().length > 0 && data.payload.streetAddress.trim().match(new RegExp(/\d+/g)) ? data.payload.streetAddress.trim() : false;
	const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

	// check that email is valid, else throw error
	if(email){
		// check that at least one of user properties is about to be updated else throw error
		if(name || streetAddress || password){

			const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

			// Verify that user has access to PUT his data
			handlers._tokens.verifyToken(token, email, function(tokenIsValid){

				if(tokenIsValid) {

					// Lookup the user
					_data.read('users', email, function(err, userData){
						if(!err && userData) {

							if(name) {
								userData.name = name;
							}
							if(streetAddress){
								userData.streetAddress = streetAddress;
							}
							if(password){
								userData.hashedPassword = helpers.hash(password);
							}
							// Update user data
							_data.update('users', email, userData, function(err){
								if(!err){
									callback(200);
								} else {
									callback(500, {'Error':'Could not update specified user'});
								}
							});

						} else {
							callback(400, {'Error':'The specified user doesn\'t exist'});
						}
					});

				} else {
					callback(403, {'Error':'Missing token or token is invalid'});
				}

			});

		} else {
			callback(400, {'Error':'Missing fields to update'});
		}

	} else {
		callback(400, {'Error':'Missing required fields'});
	}
};

// Users - delete
// Required fields: email
// Optional fields: none 
handlers._users.delete = function(data, callback){
	// Check that the provided email is valid
	const email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 && data.queryStringObject.email.trim().match('@').length == 1 && data.queryStringObject.email.trim().match('.').length >= 1 && data.queryStringObject.email.trim().match(new RegExp(/\w+@\w+\.\w+/g)) !== null ? data.queryStringObject.email.trim() : false;

	if(email) {
		
		const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
		
		// Verify that user has access to DELETE his data
		handlers._tokens.verifyToken(token, email, function(tokenIsValid){

			if(tokenIsValid){

				// Lookup the user
				_data.read('users', email, function(err, userData){
					if(!err && userData){

						//Delete the user
						_data.delete('users', email, function(err){
							if(!err) {
								callback(200);
							} else {
								callback(500, {'Error':'Could not delete specified user'});
							}
						});

					} else {
						callback(400, {'Error':'Could not find specified user'});
					}
				});

			} else {
				callback(403, {'Error':'Missing token or token is invalid'});	
			}

		});

	} else {
		callback(400, {'Error':'Missing required fields'});
	}
};


/*---- tokens handler ----*/

handlers.tokens = function(data, callback){
	const acceptableMethods = ['post','get','put','delete'];

	if(acceptableMethods.indexOf(data.method) > -1) {
		handlers._tokens[data.method](data, callback);
	} else {
		callback(405)
	}

}


// Create tokens container
handlers._tokens = {};

// tokens - post
// Required fields: email, password
// Optional fields: none
handlers._tokens.post = function(data, callback){
	const email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 && data.payload.email.trim().indexOf('@') > -1 && data.payload.email.trim().indexOf('.') >= 1 && data.payload.email.trim().match(new RegExp(/\w+@\w+\.\w+/g)) != null ? data.payload.email.trim() : false;
	const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

	if(email && password) {
		// Look up the user with that email
		_data.read('users', email, function(err, userData){
			if(!err && userData) {

				// Hash the given password
				const hashedPassword = helpers.hash(password);
				// Compare hashed password with the password that is stored
				if(hashedPassword == userData.hashedPassword) {

					// Create a new token ID
					const tokenId = helpers.generateRandomString(20);
					// Create new expiry date
					const expires = Date.now() + 1000 * 60 * 60; 

					// Create token user type (@WIP)
					const type = typeof(userData.type) == 'string' && ['admin', 'user'].indexOf(userData.type) > -1 ? userData.type : false;

					// Create token object
					const tokenObject = {
						'email': email,
						'id': tokenId,
						'expires': expires,
						'type': type
					}
					
					// Create token file (store token)
					_data.create('tokens', tokenId, tokenObject, function(err){
						if(!err) {
							callback(200, tokenObject);
						} else {
							callback(500, {'Error':'Could not create new token'});
						}
					});

				} else {
					callback(400, {'Error':'Password provided doesn\'t match with stored one'});
				}

			} else {
				callback(400, {'Error':'Could not find spedified user'});
			}

		});

	} else {
		callback(400, {'Error':'Missing required fields'});
	}

};

// tokens - get
// Required fields: tokenId
// Optional fields: none
handlers._tokens.get = function(data, callback){
	const tokenId = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false; 

	if(tokenId) {

		_data.read('tokens', tokenId, function(err, tokenData){
			if(!err && tokenData){
				delete tokenData.type;
				callback(200, tokenData);
			} else {
				callback(404);
			}
		});

	} else {
		callback(400, {'Error':'Missing required data'})
	}

};

// tokens - put
// Required fields: id, expire (boolean)
// Optional fields: none
handlers._tokens.put = function(data, callback){
	const tokenId = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
	const extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;

	if(tokenId && extend) {
		// Lookup specified token
		_data.read('tokens', tokenId, function(err, tokenData){
			if(!err && tokenData) {

				// Check if token is getting renewed inside the specified period of time
				if(tokenData.expires > Date.now()) {

					tokenData.expires = Date.now() + 1000 * 60 * 60;

					// Write the new expiration updating token data
					_data.update('tokens', tokenId, tokenData, function(err){
						if(!err){
							callback(200);
						} else {
							callback(500, {'Error':'Could not update tokens expiration'});
						}
					});

				} else {
					callback(400, {'Error':'The token has been expired and cannot be renewed'});
				}

			} else {
				callback(400, {'Error':'Could not find specified token'})
			}

		});

	} else {
		callback(400, {'Error':'Missing required fields'});
	}

};

// tokens - delete
// Required fields: id
// Optional fields: none
handlers._tokens.delete = function(data, callback){

	const tokenId = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

	if(tokenId){

		// Lookup token
		_data.read('tokens', tokenId, function(err, tokenData){
			if(!err && tokenData) {

				// Delete token
				_data.delete('tokens', tokenId, function(err){
					if(!err) {
						callback(200);
					} else {
						callback(500, {'Error':'Could ot delete specified token'});
					}
				});

			} else {
				callback(400, {'Error':'Could not find specified token'});
			}
		});

	} else {
		callback(400, {'Error':'Missing required fields'});
	}

};

//@WIP: Verify a token for a given user OR any of the admins(!?)
handlers._tokens.verifyToken = function(tokenId, email, callback) {

	// Look up the token
	_data.read('tokens', tokenId, function(err, tokenData){

		if(!err && tokenData){
			// Check user email & expiry date 
			// OR user IS admin and his token has not expired (@WIP, I don't know if this is a good practice, trying to apply very simple access levels)
			if(tokenData.email == email && tokenData.expires > Date.now() || tokenData.type == 'admin' && tokenData.expires > Date.now()){
				callback(true);
			} else {
				callback(false);
			}
		} else {
			callback(false);
		}

	});
}



/*---- menuitems handler ----*/

handlers.menuitems = function(data, callback){
	const acceptableMethods = ['post','get','put','delete'];

	if(acceptableMethods.indexOf(data.method) > -1) {
		handlers._menuitems[data.method](data, callback);
	} else {
		callback(405);
	}

};

// Menuitems container object
handlers._menuitems = {};

// Menuitems - post
// Required data: itemName, price, type ['pizza', 'pasta']
// Optional Data: none
// @WIP: only admin can POST menuitems (admin authentication)
handlers._menuitems.post = function(data, callback) {

	const itemName = typeof(data.payload.itemName) == 'string' && data.payload.itemName.trim().length > 0 ? data.payload.itemName.toLowerCase() : false;
	const price = typeof(data.payload.price) == 'number' ? data.payload.price : false;
	const type = typeof(data.payload.type) == 'string' && ['pizza', 'pasta'].indexOf(data.payload.type) > -1 ? data.payload.type.toLowerCase() : false;

	if( itemName && price && type ){

		const token = typeof(data.headers.token) == 'string' && data.headers.token.length == 20 ? data.headers.token : false;

		if(token) {

			// @WIP - I don't know if this is a good authentication practice. Trying to achieve very simple access levels.
			// Considering that email is mandatory for token verification, instead of including email in the payload or as a query string,
			// I chose to lookup token.
			// @TODO: also test email using payload OR as a query string
			
			// Lookup the token
			_data.read('tokens', token, function(err, tokenData){
				const utype = tokenData.type;

				if(!err && tokenData && utype == 'admin') {
					
					const email = typeof(tokenData.email) == 'string' && tokenData.email.trim().length > 0 && tokenData.email.trim().indexOf('@') > -1 && data.payload.email.trim().indexOf('.') >= 1 && tokenData.email.trim().match(new RegExp(/\w+@\w+\.\w+/g)) != null ? tokenData.email.trim() : false;

					// Check if token expired
					handlers._tokens.verifyToken(token, email, function(tokenIsValid){

						if(tokenIsValid) {

							// Look up for menuitem 
							_data.read('menuitems', type+'_'+itemName, function(err, pizzaData){
								// If menuitem does not exist
								if(err) {
									// Define menuitem object
									const item = {
										'itemName': itemName,
										'price': price,
										'type': type
									};
									// Create menuitem
									_data.create('menuitems', type+'_'+itemName, item, function(err){
										if(!err){
											callback(200);
										} else {
											callback(500, {'Error':'Couldn\'t create new item'});
										}
									});				
								} else {
									callback(400, {'Error':'Item '+type+'_'+itemName+' already exists'});
								}
							});

						} else {
							callback(403);
						}

					});

				} else {
					callback(405);
				}
			});

		} else {
			callback(403, {'Error':'You are not logged in'})
		}

	} else {
		callback(400, {'Error':'Missing required fields'});
	}

};

// Menuitems - get
// Required data: type, name
// Optional Data: none
// @TODO users authentication
handlers._menuitems.get = function(data, callback) {
	const type = typeof(data.queryStringObject.type) == 'string' && ['pizza','pasta'].indexOf(data.queryStringObject.type.trim()) > -1 ? data.queryStringObject.type.trim() : false;
	const name = typeof(data.queryStringObject.name) == 'string' && data.queryStringObject.name.trim().length > 0 ? data.queryStringObject.name.trim().toLowerCase() : false;

	if(type && name){
		const itemName = type+'_'+name;
		const token = typeof(data.headers.token) == 'string' && data.headers.token.length == 20 ? data.headers.token : false;

		if(token){

			// @WIP - I don't know if this is a good authentication practice. Trying to achieve very simple access levels.
			// Considering that email is mandatory for token verification, instead of including email in the payload or as a query string,
			// I chose to lookup token.
			// @TODO: also test email using payload OR as a query string 

			// Lookup token
			_data.read('tokens', token, function(err, tokenData){
				if(!err && tokenData){

					const email = typeof(tokenData.email) == 'string' && tokenData.email.trim().length > 0 && tokenData.email.trim().indexOf('@') > -1 && data.payload.email.trim().indexOf('.') >= 1 && tokenData.email.trim().match(new RegExp(/\w+@\w+\.\w+/g)) != null ? tokenData.email.trim() : false;

					// Check if token has expired
					handlers._tokens.verifyToken(token, tokenData.email, function(tokenIsValid){

						if(tokenIsValid) {

							// Lookup menuitem
							_data.read('menuitems', itemName, function(err, itemData){
								if(!err && itemData) {
									callback(200, itemData);
								} else {
									callback(404);
								}
							});

						} else {
							callback(403);
						}

					});

				} else {
					callback(405);
				}
			});
		} else {
			callback(403, {'Error':'You are not logged in'})
		}
	} else {
		callback(400, {'Error':'Missing required fields'});
	}
	
};

// Menuitems - put
// Required data: type, itemName
// Optional Data: price
// @WIP: only admin can UPDATE menuitems (admin authentication)
handlers._menuitems.put = function(data, callback) {
	const type = typeof(data.payload.type) == 'string' && ['pizza','pasta'].indexOf(data.payload.type) > -1 ? data.payload.type : false;
	const name = typeof(data.payload.itemName) == 'string' && data.payload.itemName.trim().length > 0 ? data.payload.itemName.trim().toLowerCase() : false;

	if(type && name) {
		const itemName = type+'_'+name;
		const price = typeof(data.payload.price) == 'number' && data.payload.price > 0 ? data.payload.price : false;
		const token = typeof(data.headers.token) == 'string' && data.headers.token.length == 20 ? data.headers.token : false;

		if(token){

			// @WIP - I don't know if this is a good authentication practice. Trying to achieve very simple access levels.
			// Considering that email is mandatory for token verification, instead of including email in the payload or as a query string,
			// I chose to lookup token.
			// @TODO: also test email using payload OR as a query string

			// Lookup token
			_data.read('tokens', token, function(err, tokenData){
				const utype = tokenData.type;

				if(!err && tokenData && utype == 'admin'){

					const email = typeof(tokenData.email) == 'string' && tokenData.email.trim().length > 0 && tokenData.email.trim().indexOf('@') > -1 && data.payload.email.trim().indexOf('.') >= 1 && tokenData.email.trim().match(new RegExp(/\w+@\w+\.\w+/g)) != null ? tokenData.email.trim() : false;

					// Check if token has expired
					handlers._tokens.verifyToken(token, email, function(tokenIsValid){

						if(tokenIsValid) {

							// Lookup menuitem
							_data.read('menuitems', itemName, function(err, itemData){
								if(!err && itemData) {
									// If current price is different from the given one
									if(itemData.price != price) {
										itemData.price = price;
										// Update menuitem's price
										_data.update('menuitems', itemName, itemData, function(err){
											if(!err) {
												callback(200);
											} else {
												callback(500, {'Error':'There was a problem updating specified menu item'});
											}
										});
									}
								} else {
									callback(400, {'Error':'Could not find specified menu item'});
								}
							});

						} else {
							callback(403);
						}

					});

				} else {
					callback(405);
				}
			});
		} else {
			callback(403, {'Error':'Please login to proceed'});
		}

	} else {
		callback(400, {'Error':'Missing required fields'});
	}

};

// Menuitems - delete
// Required data: type, itemName
// Optional Data: none
// @WIP: only admin can DELETE menuitems (admin authentication)
handlers._menuitems.delete = function(data, callback) {
	const type = typeof(data.queryStringObject.type) == 'string' && ['pizza','pasta'].indexOf(data.queryStringObject.type.trim()) > -1 ? data.queryStringObject.type.trim() : false;
	const name = typeof(data.queryStringObject.name) == 'string' && data.queryStringObject.name.trim().length > 0 ? data.queryStringObject.name.trim().toLowerCase() : false;

	if(type && name){
		const itemName = type+'_'+name;
		const token = typeof(data.headers.token) == 'string' && data.headers.token.length == 20 ? data.headers.token : false;

		if(token){

			// @WIP - I don't know if this is a good authentication practice. Trying to achieve very simple access levels.
			// Considering that email is mandatory for token verification, instead of including email in the payload or as a query string,
			// I chose to lookup token.
			// @TODO: also test email using payload OR as a query string

			_data.read('tokens', token, function (err, tokenData){
				const utype = tokenData.type;

				if(!err && tokenData && utype == 'admin') {
					const email = typeof(tokenData.email) == 'string' && tokenData.email.trim().length > 0 && tokenData.email.trim().indexOf('@') > -1 && data.payload.email.trim().indexOf('.') >= 1 && tokenData.email.trim().match(new RegExp(/\w+@\w+\.\w+/g)) != null ? tokenData.email.trim() : false;

					// Check if token has expired
					handlers._tokens.verifyToken(token, email, function(tokenIsValid){

						if(tokenIsValid) {

							_data.read('menuitems', itemName, function(err, itemData){
								if(!err && itemData){

									_data.delete('menuitems', itemName, function(err){
										if(!err) {
											callback(200);
										} else {
											callback(500, {'Error':'Could not delete specified menu item'});
										}
									});

								} else {
									callback(400, {'Error':'Specified menu item not found, it might not exist'});
								}
							});

						} else {
							callback(403);
						}

					});

				} else {
					callback(405);
				}

			});

		} else {
			callback(403, {'Error':'You are not logged in'});
		}

	} else {
		callback(400, {'Error':'Missing required fields'});
	}

};

// Get entire menu
handlers.allMenuItems = function(data, callback){

	const token = typeof(data.headers.token) == 'string' && data.headers.token.length == 20 ? data.headers.token : false;

	if(token){

		// @WIP - I don't know if this is a good authentication practice. Trying to achieve very simple access levels.
		// Considering that email is mandatory for token verification, instead of including email in the payload or as a query string,
		// I chose to lookup token.
		// @TODO: also test email using payload OR as a query string
		_data.read('tokens', token, function (err, tokenData){

			if(!err && tokenData) {

				const email = typeof(tokenData.email) == 'string' && tokenData.email.trim().length > 0 && tokenData.email.trim().indexOf('@') > -1 && tokenData.email.trim().indexOf('.') >= 1 && tokenData.email.trim().match(new RegExp(/\w+@\w+\.\w+/g)) != null ? tokenData.email.trim() : false;

				// Check if the token has expired
				handlers._tokens.verifyToken(token, email, function(tokenIsValid){

					if(tokenIsValid) {

						// Get all the menuitems
						_data.list('menuitems', function(err, menuItems){
							if(!err && menuItems && menuItems.length > 0) {
								const menu = [];
								// For each menu item
								menuItems.forEach(function(item, index){
									// Lookup item
									_data.read('menuitems', item, function(err, itemData){
										if(!err && itemData) {

											menu.push(itemData);

											if(index == menuItems.length-1){
												callback(200, menu);
											}

										} else {
											callback(err, data);
										}

									});

								});

							} else {
								callback(400, {'Error':'Problem getting menu or menu empty'})
							}
						});


					} else {
						callback(403);
					}


				});

			} else {
				callback(405);
			}

		});
	} else {
		callback(403, {'Error':'You are not logged in'});
	}
};

// not found handler
handlers.notFound = function(data, callback){
	callback(404);
};

// Export module
module.exports = handlers;