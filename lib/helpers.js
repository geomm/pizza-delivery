/*
 * Helpers methods for various tasks
 *
 */

// Dependencies
const crypto = require('crypto');
const config = require('./config');

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

// Export module
module.exports = helpers;





