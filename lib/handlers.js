/*
 * Request handlers related tasks
 *
 */

// Dependencies



// Instantiate handlers object
const handlers = {};

// testing handler
handlers.test = function(data, callback){
	callback(200, {'name':'test handler'});
};

// not found handler
handlers.notFound = function(data, callback){
	callback(404);
};

// Export module
module.exports = handlers;