/*
 * Helpers methods for various tasks
 *
 */

// Dependencies


// Instantiate object
const helpers = {};

// Parse JSON string to Object
helpers.parseJsonToObject = function(str){
	try {
		const obj = JSON.parse(str);
		return obj;
	} catch(e) {
		return {};
	}
};


// Export module
module.exports = helpers;





