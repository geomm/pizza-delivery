/*
 * Server related tasks
 *
 */

// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const handlers = require('./handlers');
const helpers = require('./helpers');
const util = require('util');
const debug = util.debuglog('server');
const config = require('./config');

// Server object instantiation
const server = {};

// Instantiate Server
// @TODO: add https server too
server.httpServer = http.createServer(function(req, res){
	server.commonServer(req, res);
});

// Server logic (common for http, https)
server.commonServer = function(req, res){
	
	// Get input url 
	const parsedUrl = url.parse(req.url, true); // true here means "parse the query string"
	// && Extract path from url
	const path = parsedUrl.pathname;
	// && Remove slashes from begin and end of the pathname
	const trimmedPath = path.replace(/^\/+|\/+$/g, '');

	// Get query string from parsed url
	const queryStringObject = parsedUrl.query;

	// Get method used from req object
	const method = req.method.toLowerCase();

	// Get headers used from req object
	const headers = req.headers;

	// create string decoder to parse the payload using it
	let decoder = new StringDecoder('utf-8');
	
	// Get payload if any (node stream)
	let buffer = '';

	// (node stream)
	req.on('data', function(data){
		buffer += decoder.write(data);
	});
	// (node stream)
	req.on('end', function(){
		buffer += decoder.end();

		// Construct the data object (from request) to send to the handler
		const requestData = {
			'trimmedPath': trimmedPath,
			'queryStringObject': queryStringObject,
			'method': method,
			'headers': headers,
			'payload': helpers.parseJsonToObject(buffer)
		}

		// Get the input handler
		const inputHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : server.router.notFound;

		// Server response to request
		inputHandler(requestData, function(statusCode, payload){
			// status code sanity check
			statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
			// payload sanity check
			payload = typeof(payload) == 'object' ? payload : {};

			// convert payload to a string 
			const payloadString = JSON.stringify(payload);

			// Return the server response
			res.setHeader('Content-type', 'application/JSON');
			res.writeHead(statusCode);
			res.end(payloadString);

			// Debug log
			if(statusCode == 200){
				debug('\x1b[32m%s\x1b[0m', method.toUpperCase()+' '+trimmedPath+' '+statusCode);
			} else {
				debug('\x1b[31m%s\x1b[0m', method.toUpperCase()+' '+trimmedPath+' '+statusCode);
			}

		});
	});
};

server.init = function(){
	// Start http server
	// @TODO: add https server too
	server.httpServer.listen(config.httpPort, function(){
		console.log('\x1b[36m%s\x1b[0m', `The server is running on port ${config.httpPort}`);
	});
};

server.router = {
	'test' : handlers.test,
	'users' : handlers.users,
	'notFound' : handlers.notFound
};

// Export module
module.exports = server;