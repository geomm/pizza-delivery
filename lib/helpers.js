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

// Export module
module.exports = helpers;





