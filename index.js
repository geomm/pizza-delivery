/*
 * Primary API file
 *
 */

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers')

// Instantiate app
const app = {};

// Initialize app
app.init = function(){

	// Initialize server
	server.init();

	// Initialize workers
	workers.init();

};

// Execute app initialization
app.init();

// Export module
module.exports = app;