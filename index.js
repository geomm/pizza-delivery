/*
 * Primary API file
 *
 */

// Dependencies
const server = require('./lib/server');

// Instantiate app
const app = {};

// Initialize app
app.init = function(){

	// Initialize server
	server.init();

};

// Execute app initialization
app.init();

// Export module
module.exports = app;