/*
 * Helpers methods for various tasks
 *
 */

// Dependencies
const crypto = require('crypto');
const config = require('./config');

const https = require('https');
const querystring = require('querystring') // Stripe API

// Instantiate helpers object
const helpers = {};

// Parse JSON string to Object
helpers.parseJsonToObject = function(str){
	try {
		let obj = JSON.parse(str);
		return obj;
	} catch(e) {
		return {};
	}
};

// Create SHA256 hash from given string password
helpers.hash = function(str){
	if( typeof(str) == 'string' && str.trim().length > 0 ){
		const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
		return hash;
	} else {
		return false;
	}
};

// Generate a random alphanumeric string of the given length
helpers.generateRandomString = function(length){
	length = typeof(length) == 'number' && length > 0 ? length : false;

	if(length) {

		// Characters accepted for random string generation
		const acceptedChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
		// Final string to be returned
		let fnlString = '';

		for(i=0; i<length; i++) {
			// Generate a random char
			const randomChar = acceptedChars.charAt(Math.floor(Math.random() * acceptedChars.length));
			// and append it to the final string
			fnlString += randomChar;
		}

		return fnlString;

	} else {
		return false;
	}

};


// Generate a random numeric value of the given length
helpers.generateRandomNumericValue = function(length){
	length = typeof(length) == 'number' && length > 0 ? length : false;

	if(length) {

		// Characters accepted for random string generation
		const acceptedNumbers = '0123456789';
		// Final string to be returned
		let fnlNumber = '';

		for(i=0; i<length; i++) {
			// Generate a random char
			const randomMumber = acceptedNumbers.charAt(Math.floor(Math.random() * acceptedNumbers.length));
			// and append it to the final string
			fnlNumber += randomMumber;
		}

		return fnlNumber;

	} else {
		return false;
	}

};


// @WIP: Submit payment via stripe
// Need to calibrate this pizza delivery api (needs SKU etc)
// in order to be aligned with Stripe api
helpers.submitStripePayment = function(email, shoppingCart, callback){

	email = typeof(email) == 'string' && email.trim().length > 0 && email.trim().match('@').length == 1 && email.trim().match('.').length >= 1 && email.trim().match(new RegExp(/\w+@\w+\.\w+/g)) != null ? email.trim() : false;
	shoppingCart = typeof(shoppingCart) == 'object' ? shoppingCart : {};
 
	if(email && shoppingCart) {

		// Configure payload
		const payload = {
			'email' : email,
			'shoppingCart': shoppingCart
		}

		// Stringify payload
		const stringPayload = querystring.stringify(payload);

		// Configure request details
		const requestDetails = {
			'protocol':'https',
			'hostname':'api.stripe.com',
			'method':'POST',
			'':'',
			'':'',
			'headers': {
				'Content-Type' : 'application/x-www-form-urlencoded',
				'Content-Length' : Buffer.byteLength(stringPayload)
			}
		}

		// Instantiate the request object
		const req = https.request(requestDetails, function(res){
			// response status
			const status = res.statusCode;
			// Callback with regards the status code returned
			if(status == 200 || status == 201) {
				callback(false);
			} else {
				callback('Error with status code: '+status);
			}

		});

		// handle req error
		req.on('error', function(e){
			callback(e);
		});

		// Add the payload to the request
		req.write(stringPayload);

		// End the request
		req.end();


	} else {
		callback('Given parameters are missing or invalid');
	}

};


// Export module
module.exports = helpers;





