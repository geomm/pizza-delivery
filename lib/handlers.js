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

// Tokens - post
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

// Tokens - get
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

// Tokens - put
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

// Tokens - delete
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
			// Check user email & expiry date OR,
			// (@TODELETE:) check if user IS admin (no email :/) and his token has not expired (@WIP apply in clear & safe manner very simple access levels)
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
// Required data: name, price, type
// Optional Data: none
// @WIP: only admin can POST menuitems (admin authentication)
handlers._menuitems.post = function(data, callback) {

	const name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name.toLowerCase() : false;
	const price = typeof(data.payload.price) == 'number' ? data.payload.price : false;
	const type = typeof(data.payload.type) == 'string' && ['pizza', 'pasta'].indexOf(data.payload.type) > -1 ? data.payload.type.toLowerCase() : false;

	if( name && price && type ){

		const itemId = helpers.generateRandomNumericValue(3);

		const token = typeof(data.headers.token) == 'string' && data.headers.token.length == 20 ? data.headers.token : false;

		if(token) {

			// @WIP - I don't know if this is a good authentication practice. Trying to achieve very simple access levels.
			// Considering that email is mandatory for token verification, instead of including email in the payload or as a query string,
			// I chose to lookup token.
			
			
			// Lookup the token
			_data.read('tokens', token, function(err, tokenData){
				const utype = tokenData.type;

				if(!err && tokenData && utype == 'admin') {
					
					const email = typeof(tokenData.email) == 'string' && tokenData.email.trim().length > 0 && tokenData.email.trim().indexOf('@') > -1 && tokenData.email.trim().indexOf('.') >= 1 && tokenData.email.trim().match(new RegExp(/\w+@\w+\.\w+/g)) != null ? tokenData.email.trim() : false;

					// Check if token expired
					handlers._tokens.verifyToken(token, email, function(tokenIsValid){

						if(tokenIsValid) {

							// Look up for menuitem 
							_data.read('menuitems', itemId, function(err, pizzaData){
								// If menuitem does not exist
								if(err) {
									// Define menuitem object
									const item = {
										'itemId': itemId,
										'name': name,
										'price': price,
										'type': type
									};
									// Create menuitem
									_data.create('menuitems', itemId, item, function(err){
										if(!err){
											callback(200);
										} else {
											callback(500, {'Error':'Couldn\'t create new item'});
										}
									});				
								} else {
									callback(400, {'Error':'Item '+itemId+' already exists'});
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
// Required data: itemId
// Optional Data: none
// @TODO users authentication
handlers._menuitems.get = function(data, callback) {
	// @TODELETE:
	// const type = typeof(data.queryStringObject.type) == 'string' && ['pizza','pasta'].indexOf(data.queryStringObject.type.trim()) > -1 ? data.queryStringObject.type.trim() : false;
	// const name = typeof(data.queryStringObject.name) == 'string' && data.queryStringObject.name.trim().length > 0 ? data.queryStringObject.name.trim().toLowerCase() : false;

	const itemId = typeOf(data.queryStringObject.itemId) == 'number' && data.queryStringObject.itemId.length == 3 ? data.queryStringObject.itemId : false;

	if(itemId){//type && name
		// const name = type+'_'+name;
		const token = typeof(data.headers.token) == 'string' && data.headers.token.length == 20 ? data.headers.token : false;

		if(token){

			// @WIP - I don't know if this is a good authentication practice. Trying to achieve very simple access levels.
			// Considering that email is mandatory for token verification, instead of including email in the payload or as a query string,
			// I chose to lookup token.
			 

			// Lookup token
			_data.read('tokens', token, function(err, tokenData){
				if(!err && tokenData){

					const email = typeof(tokenData.email) == 'string' && tokenData.email.trim().length > 0 && tokenData.email.trim().indexOf('@') > -1 && data.payload.email.trim().indexOf('.') >= 1 && tokenData.email.trim().match(new RegExp(/\w+@\w+\.\w+/g)) != null ? tokenData.email.trim() : false;

					// Check if token has expired
					handlers._tokens.verifyToken(token, tokenData.email, function(tokenIsValid){

						if(tokenIsValid) {

							// Lookup menuitem
							_data.read('menuitems', itemId, function(err, itemData){
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
// Required data: itemId
// Optional Data: price, type, name
// @WIP: only admin can UPDATE menuitems (admin authentication)
handlers._menuitems.put = function(data, callback) {

	const itemId = typeof(data.payload.itemId) == 'number' && data.payload.itemId.toString().length == 3 && parseInt(data.payload.itemId) != NaN ? data.payload.itemId : false;

	if(itemId) {
		const name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim().toLowerCase() : false;
		const type = typeof(data.payload.type) == 'string' && ['pizza','pasta'].indexOf(data.payload.type) > -1 ? data.payload.type : false;
		const price = typeof(data.payload.price) == 'number' && data.payload.price > 0 ? data.payload.price : false;

		const token = typeof(data.headers.token) == 'string' && data.headers.token.length == 20 ? data.headers.token : false;

		if(token){

			// @WIP - I don't know if this is a good authentication practice. Trying to achieve very simple access levels.
			// Considering that email is mandatory for token verification, instead of including email in the payload or as a query string,
			// I chose to lookup token.
			
			// Lookup token
			_data.read('tokens', token, function(err, tokenData){
				const utype = tokenData.type;

				if(!err && tokenData && utype == 'admin'){

					const email = typeof(tokenData.email) == 'string' && tokenData.email.trim().length > 0 && tokenData.email.trim().indexOf('@') > -1 && tokenData.email.trim().indexOf('.') >= 1 && tokenData.email.trim().match(new RegExp(/\w+@\w+\.\w+/g)) != null ? tokenData.email.trim() : false;

					// Check if token has expired
					handlers._tokens.verifyToken(token, email, function(tokenIsValid){

						if(tokenIsValid) {

							// Lookup menuitem
							_data.read('menuitems', itemId, function(err, itemData){
								if(!err && itemData) {
									// If current name is different from the given one
									if(itemData.name != name) {
										// Update menuitem's name
										itemData.name = name;
									}
									// If current type is different from the given one
									if(itemData.type != type){
										// Update menuitem's type
										itemData.type = type;
									}
									// If current price is different from the given one
									if(itemData.price != price) {
										// Update menuitem's price
										itemData.price = price;
									}

									_data.update('menuitems', itemId, itemData, function(err){
										if(!err) {
											callback(200);
										} else {
											callback(500, {'Error':'There was a problem updating specified menu item'});
										}
									});
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
// Required data: itemId
// Optional Data: none
// @WIP: only admin can DELETE menuitems (admin authentication)
handlers._menuitems.delete = function(data, callback) {
	const itemId = typeof(data.queryStringObject.itemId) == 'string' && data.queryStringObject.itemId.length == 3 && parseInt(data.queryStringObject.itemId) != NaN ? data.queryStringObject.itemId : false;
	
	if(itemId){

		const token = typeof(data.headers.token) == 'string' && data.headers.token.length == 20 ? data.headers.token : false;

		if(token){

			// @WIP - I don't know if this is a good authentication practice. Trying to achieve very simple access levels.
			// Considering that email is mandatory for token verification, instead of including email in the payload or as a query string,
			// I chose to lookup token.

			_data.read('tokens', token, function (err, tokenData){
				const utype = tokenData.type;

				if(!err && tokenData && utype == 'admin') {
					const email = typeof(tokenData.email) == 'string' && tokenData.email.trim().length > 0 && tokenData.email.trim().indexOf('@') > -1 && tokenData.email.trim().indexOf('.') >= 1 && tokenData.email.trim().match(new RegExp(/\w+@\w+\.\w+/g)) != null ? tokenData.email.trim() : false;

					// Check if token has expired
					handlers._tokens.verifyToken(token, email, function(tokenIsValid){

						if(tokenIsValid) {

							_data.read('menuitems', itemId, function(err, itemData){
								if(!err && itemData){

									_data.delete('menuitems', itemId, function(err){
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
		
		// Lookup token
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



/*---- shopping cart handler ----*/

handlers.shoppingCarts = function(data, callback) {
	const acceptableMethods = ['post', 'get', 'put', 'delete'];
	if(acceptableMethods.indexOf(data.method) > -1) {
		handlers._shoppingCarts[data.method](data, callback);
	} else {
		callback(405);
	}
};

// Order object container
handlers._shoppingCarts = {};

// ShoppingCarts - post
// Required data: email, items
// Optional data: none
handlers._shoppingCarts.post = function(data, callback){

	const email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 && data.payload.email.trim().match('@').length == 1 && data.payload.email.trim().match('.').length >= 1 && data.payload.email.trim().match(new RegExp(/\w+@\w+\.\w+/g)) != null ? data.payload.email.trim() : false;
	const items = typeof(data.payload.items) == 'object' && data.payload.items instanceof Array && data.payload.items.length == 0 ? data.payload.items : false; // && data.payload.items.length > 0 

	if(email && items) {

		const token = typeof(data.headers.token) == 'string' && data.headers.token.length == 20 ? data.headers.token : false;

		// Verify that the given token is valid for that email - user is creating his own cart (AND NOT else's)
		handlers._tokens.verifyToken(token, email, function(tokenIsValid){

			if(tokenIsValid) {

				// Generate a random 5 length numeric value
				const cartId = helpers.generateRandomNumericValue(5);
				// When first created, the shoppingCart object has NOT any items in cart items, hence the payment amount is 0
				const total = 0;
				// proceedPayment boolean default to false, Payment action can be triggered only via handlers._shoppingCarts.update method, if proceedPayment updated to true
				const proceedPayment = false;

				// Lookup if order doesn't exists
				_data.read('shoppingCarts', cartId, function(err, orderData){
					// If cart does not exist
					if(err){
						const cartObject = {
							'cartId': cartId,
							'email': email,
							'date' : Date.now(),
							'items': items, // itemId & quantity
							'total': total,
							'proceedPayment': proceedPayment
						}

						// Store new shopping cart
						_data.create('shoppingcarts', cartId, cartObject, function(err){
							if(!err) {
								callback(200);
							} else {
								callback(500, {'Error':'Could not create new shopping cart'})
							}
						});

					} else {
						callback(400, {'Error':'Order already exists'});
					}

				});

			} else {
				callback(403, {'Error':'Missing required token in header, or token is invalid'});
			}

		});

	} else {
		callback(400, {'Error':'Missing required fields'});
	}

};

// ShoppingCarts - get
// Required fields: cartId
// Optional fields: none
handlers._shoppingCarts.get = function(data, callback){
	const cartId = parseInt(data.queryStringObject.cartId) != NaN && typeof(data.queryStringObject.cartId) == 'string' && data.queryStringObject.cartId.length == 5 ? data.queryStringObject.cartId : false;

	if(cartId) {

		// Lookup cartId
		_data.read('shoppingcarts', cartId, function(err, cartData){
			if(!err && cartData) {

				const token = typeof(data.headers.token) == 'string' && data.headers.token.length == 20 ? data.headers.token : false;
				const email = typeof(cartData.email) == 'string' && cartData.email.trim().length > 0 && cartData.email.trim().match('@').length == 1 && cartData.email.trim().match('.').length >= 1 && cartData.email.trim().match(new RegExp(/\w+@\w+\.\w+/g)) != null ? cartData.email.trim() : false;

				// Verify that token is valid 
				// AND user is READ-ing his own cart
				handlers._tokens.verifyToken(token, email,function(tokenIsValid){
					if(tokenIsValid) {

						callback(200, cartData);

					} else {

						callback(403, {'Error':'Missing required token or token is invalid'});

					}
				});				

			} else {
				callback(403);
			}
		});

	} else {
		callback(400, {'Error':'Missing required fields'});
	}

};

// ShoppingCarts - put
// Required fields: cartId
// Optional fields: cartItems:{itemId:XXX,quantity:X} ,{itemId:XXX,quantity:X} ,.. , proceedPayment
// NOTE: if proceedPayment == true, ORDER is created (calculating total costs AND applying VAT)
handlers._shoppingCarts.put = function(data, callback){
	const cartId = parseInt(data.payload.cartId) != NaN && typeof(data.payload.cartId) == 'string' && data.payload.cartId.length == 5 ? data.payload.cartId : false;

	if(cartId){

		const cartItems = typeof(data.payload.items) == 'object' && data.payload.items instanceof Array && data.payload.items.length > 0 ? data.payload.items : false;
		const proceedPayment = typeof(data.payload.proceedPayment) == 'boolean' && data.payload.proceedPayment == true ? true : false;

		// Make sure cartItems not empty
		if(cartItems) {

			// Lookup shoppingCart
			_data.read('shoppingcarts', cartId, function(err, cartData){
				if(!err && cartData){

					const token = typeof(data.headers.token) == 'string' && data.headers.token.length == 20 ? data.headers.token : false;
					const email = typeof(cartData.email) == 'string' && cartData.email.trim().length > 0 && cartData.email.trim().match('@').length == 1 && cartData.email.trim().match('.').length >= 1 && cartData.email.trim().match(new RegExp(/\w+@\w+\.\w+/g)) != null ? cartData.email.trim() : false;
					
					// Verify that token is valid
					// AND user is UPDATE-ing his own cart through cartData.email
					handlers._tokens.verifyToken(token, email, function(tokenIsValid){
						// Token is valid
						if(tokenIsValid) {

							// Update proceedPayment boolean with the latest proceedPayment status from payload
							cartData.proceedPayment = proceedPayment;

							// Update cartItems
							if(cartItems){
								cartData.items = cartItems;
							}

							// Store new updated cartItems
							_data.update('shoppingcarts', cartId, cartData, function(err){
								if(!err){
									if(cartData.proceedPayment == true){
										// Pass the token for order payment submission user verification
										cartData.userToken = token;
										// Create order and submit it to Stripe
										handlers._orders.post(cartData, function(res){
											if(res){
												console.log('Order ID '+cartId+' completed, status: ',res);
											}
										});
									}
									callback(200);
								} else {
									callback(500, {'Error':'Could not update specified shoppingCart'});
								}
							});

						} else {
							callback(403, {'Error':'Missing required token in header, or token is invalid'});
						}

					});

				} else {
					callback(400, {'Error':'The specified cart doesn\'t exists'});
				}
			});

		} else {
			callback(400, {'Error':'Missing fields to update or your cart is empty'});
		}


	} else {
		callback(400, {'Error':'Missing required fields'});
	}

};

// ShoppingCarts - delete
// Required fields: cartId
// Optional fields: none
handlers._shoppingCarts.delete = function(data, callback){
	const cartId = parseInt(data.queryStringObject.cartId) != NaN && typeof(data.queryStringObject.cartId) == 'string' && data.queryStringObject.cartId.length == 5 ? data.queryStringObject.cartId : false;

	if(cartId) {
		const token = typeof(data.headers.token) == 'string' && data.headers.token.length == 20 ? data.headers.token : false;
		
		// Lookup shoppingCart
		_data.read('shoppingcarts', cartId, function(err, cartData){

			if(!err && cartData) {

				const email = typeof(cartData.email) == 'string' && cartData.email.trim().length > 0 && cartData.email.trim().match('@').length == 1 && cartData.email.trim().match('.').length >= 1 && cartData.email.trim().match(new RegExp(/\w+@\w+\.\w+/g)) != null ? cartData.email.trim() : false;

				// Verify that token is valid
				// AND user is DELETE-ing his own cart
				handlers._tokens.verifyToken(token, email, function(tokenIsValid){
					if(tokenIsValid) {

						// Delete cart
						_data.delete('shoppingcarts', cartId, function(err){
							if(!err) {
								callback(200);
							} else {
								callback(500, {'Error':'Could not delete specified shoppingCart'});
							}
						});

					} else {
						callback(403, {'Error':'Missing required token in header, or token is invalid'});
					}
				});

			} else {
				callback(400, {'Error':'The specified shoppingCart doesn\'t exists'});
			}

		});

	} else {
		callback(400, {'Error':'Missing required fields'});
	}

};


/*------ Orders handler ------ */
/*

NOTE: Orders are not placed directly by the user BUT by the system authenticated as the user
(user submits cart for payment process). If the stripe charge fails, then the order remains in the orders folder
and payment process is getting interrupted.

@WIP: Order failure scenarios. 
	1. User abandoned the order,
	2. User is re-authenticating
	3. User's order details are incomplete

Else if Stripe charge succeeds, it is getting deleted from orders directory AND getting logged in user's orderHistory collection. 

Need to clarify the logic above.

*/

handlers.orders = function(data, callback) {
	const acceptableMethods = ['post', 'get', 'delete'];
	if(acceptableMethods.indexOf(data.method) > -1) {
		handlers._orders[data.method](data, callback)
	} else {
		callback(405);
	}
}

// Order object container
handlers._orders = {};

// Orders - create 
// Required data: email, proceedPayment = true, shoppingCartId, cartItems.length > 0, userToken
// Optional data: none
handlers._orders.post = function(data, callback) {

	const email = typeof(data.email) == 'string' && data.email.trim().length > 0 && data.email.trim().match('@').length == 1 && data.email.trim().match('.').length >= 1 && data.email.trim().match(new RegExp(/\w+@\w+\.\w+/g)) !== null ? data.email.trim() : false;
	const proceedPayment = typeof(data.proceedPayment) == 'boolean' && data.proceedPayment == true ? data.proceedPayment : false;
	const cartId  = typeof(data.cartId) == 'string' && data.cartId.trim().length == 5 ? data.cartId : false;
	const cartItems = typeof(data.items) == 'object' && data.items instanceof Array && data.items.length > 0 ? data.items : false;

	if(proceedPayment && cartId && cartItems){

		const token = typeof(data.userToken) == 'string' && data.userToken.trim().length == 20 ? data.userToken : false;

		// Check if user is authenticated
		handlers._tokens.verifyToken(token, email, function(tokenIsValid){

			if(tokenIsValid) {
				// Lookup orders
				_data.read('orders', cartId, function(err, orderData){
					// If there isn't any order with cartId already
					if(err){

						// Instantiate order object
						let orderObject = data;

						// Table to store selected menuitems' data
						let newCartItems = [];

						// Total order cost
						let totalCost = 0;

						// Total items to be updated in order
						const itemsToUpdate = cartItems.length;
						// Total items updated
						let itemsUpdated = 0;

						// Update cart menuitems' info for order creation and submission
						cartItems.forEach(function(item, index){

							if(item.itemId) {

								// Lookup menuitem
								_data.read('menuitems', item.itemId, function(err, itemData){

									if(!err && itemData) {

										// Calculate costs and update the cartItem object
										const newOrderItemObject = {
											"itemId": item.itemId,
											"name": itemData.name,
											"price": itemData.price,
											"quantity": item.quantity,
											"type": itemData.type,
											"itemTotal": parseFloat(itemData.price).toFixed(2)*item.quantity
										}

										// If newCartItem is not null
										if(newOrderItemObject != null) {
											// Push cartItem to the new cartItems(calculated costs) table 
											newCartItems.push(newOrderItemObject);
											itemsUpdated++;
										}

										// @TODO: Must include VAT
										// @TODO: Must include Stripe's delivery service fee
										// Update order's total cost
										totalCost += parseFloat(itemData.price).toFixed(2)*item.quantity;

										// When the last menuitem has updated it's data
										if(itemsUpdated == itemsToUpdate) {

											// Update cartData items with cartItems that include calculated costs
											orderObject.items = newCartItems;
											// Update total cost
											orderObject.total = totalCost;

											// Create Order from shoppingCart
											_data.create('orders', cartId, orderObject, function(err){
												if(!err) {
													/* 
														Now the order lives in the filesystem until it is processed successfully.
														When Mailgun email receipt is "delivered" then the order is going to be deleted from the filesystem.										
													
														@WIP: Concerned about Single responsibility principle here
														@WIP: Files are getting emptied but not deleted until node process is terminated
													*/
													// Lookup the shoppingCart
													_data.read('shoppingcarts', cartId, function(err, shoppingcartData){								
														if(!err && shoppingcartData) {

															// Delete the shoppingCart
															_data.delete('shoppingcarts', cartId, function(err){
																if(!err){
																	
																	// Submit payment to Stripe API
																	// @TODO: Need to clarify if extra user verification is required 
																	helpers.submitStripePayment( orderObject, function(err, paymentResponse){
																		if(!err && paymentResponse){

																			console.log('1.Order created,\n2.Shopping Cart deleted,\n3.Stripe api submission went ok.\nOrder details: ', paymentResponse);

																			// Track email to ensure it is delivered
																			helpers.trackMailgunEmail(paymentResponse[cartId].mailgunEmailId, function(emailDelivered){
																				// If Mailgun email event "delivered"
																				if(emailDelivered) {

																					// Lookup the user
																					_data.read('users', email, function(err, userData){
																						if(!err && userData){

																							// Check if orderHistory property exists
																							userData.orderHistory = typeof(userData.orderHistory) == 'object' && userData.orderHistory instanceof Array ? userData.orderHistory : [];
																							// Add order to user's orderHistory
																							userData.orderHistory.push(paymentResponse);

																							// Store user with updated orderHistory
																							_data.update('users', email, userData, function(err){
																								if(!err) {

																									// Lookup the order
																									_data.read('orders', cartId, function(err, orderData){
																										if(!err && orderData) {
																											// Delete the order
																											_data.delete('orders', cartId, function(err){
																												if(!err){
																													callback(200);
																												} else {
																													callback(500, {'Error':'Could not delete completed order from filesystem'});
																												}
																											});

																										} else {
																											callback(500, {'Error':'Could not find completed order on filesystem'})
																										}
																									});

																								} else {
																									callback(500, {'Error': 'Could not update user\'s order history'});
																								}
																							});

																						} else {
																							callback(500, {'Error':'Problem updating user\'s orderHistory collection'});
																						}
							
																					});


																				}

																			});


																		} else {
																			callback(err, {'Error':'Problem submiting payment to Stripe'});
																		}
																	});


																} else {
																	callback(500, {'Error':'Could not delete shopping cart'});
																}
															});
														} else {

															callback(500, {'Error':'Could not find shopping cart to delete.'});
														}

													});
													
												} else {
													callback(500, {'Error':'Could not save order'});
												}
											});

										}

									} else {
										console.log('Could not read order menuitems');
									}

								});
							} else {
								console.log('Could not find item ID');
							}

						});

					} else {
						callback(400, {'Error':'Order already exists'});
					}
				});


			} else {
				callback(403, {'Error':'Missing required token in header, or token is invalid'});
			}

		});

	} else {
		callback(400, {'Error':'Missing required fields to complete the order'});
	}

};

// @TODO: complete handlers._orders.get, handlers._orders.delete

// not found handler
handlers.notFound = function(data, callback){
	callback(404);
};

// Export module
module.exports = handlers;