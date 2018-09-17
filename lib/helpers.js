/*
 * Helpers methods for various tasks
 *
 */

// Dependencies
const crypto = require('crypto');
const config = require('./config');

const https = require('https'); // Stripe API, Mailgun API
const querystring = require('querystring') // Stripe API, Mailgun API

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


// Submit payment via stripe
helpers.submitStripePayment = function(email, shoppingCart, callback){

	email = typeof(email) == 'string' && email.trim().length > 0 && email.trim().match('@').length == 1 && email.trim().match('.').length >= 1 && email.trim().match(new RegExp(/\w+@\w+\.\w+/g)) != null ? email.trim() : false;
	shoppingCart = typeof(shoppingCart) == 'object' ? shoppingCart : {};

	if(email && shoppingCart) {

		// Stripe API - convert to smallest currency unit dollars * 100 (cents)
		const totalCost = parseFloat(shoppingCart.total).toFixed(2) * 100;
		// Stringify shoppingCart to pass it to Mailgun function
		const cartString = JSON.stringify(shoppingCart);

		// Configure payload
		// Required properties for the Stripe API charge object
		const payload = {
			'amount': totalCost,
			'currency':'usd',
			'description':'Pizza delivery API payment',
			'source': 'tok_visa',
			'receipt_email': email
		}

		// Stringify payload
		const stringPayload = querystring.stringify(payload);

		// Configure request details
		const requestDetails = {
			'protocol':'https:',
			'hostname':'api.stripe.com',
			'method':'POST',
			'path':'/v1/charges?key='+config.stripe.secretKey,
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
				
				// Send email receipt using Mailgun API
				helpers.sendMailgunEmailReceipt(email, 'Pizza delivery - Payment completed', cartString, function(err){
					if(!err) {
						console.log('Mailgun api call went ok');
					} else {
						console.log('There was a problem sending email receipt, error:', err);
					}
				});

				// Success
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


// Send email via Mailgun
helpers.sendMailgunEmailReceipt = function(to, subject, content, callback){

	to = typeof(to) == 'string' && to.trim().length > 0 && to.trim().match('@').length == 1 && to.trim().match('.').length >= 1 && to.trim().match(new RegExp(/\w+@\w+\.\w+/g)) != null ? to.trim() : false;
	subject = typeof(subject) == 'string' && subject.trim().length > 0 ? subject : false;
	content = typeof(content) == 'string' && content.trim().length > 0 ? content : false;

	const emailBodyObject = JSON.parse(content);

	const emailHtmlBody = `
		<h1>Pizza delivery - Receipt</h1>
		<p style="color:#666666">Hi <strong>${emailBodyObject.email}</strong>,<br> your order will be there soon!</p>
		<hr style="border:1px solid #999999">
		<small style="color:#CCCCCC;">Order details start</small>
		<br>
		<dl>
			<dt><strong>Order ID:</strong></dt>
			<dd>${emailBodyObject.cartId}</dd>
			<dt><strong>Date:</strong></dt>
			<dd>${Date(emailBodyObject.date).toString()}</dd>
			<dt><strong>Items:</strong></dt>
			<dl>
			${emailBodyObject.items.map( function(item){
				return '<dt><i>'+item.type+' '+item.name+' (id:'+item.itemId+')</i></dt><dl><strong>'+item.price+'$</strong><i> (usd)</i> x <i>'+item.quantity+' (qua/ty) = </i><strong>'+item.itemTotal+'$</strong> (usd)</dl>'
			})}
			</dl>
			<dt><strong>Total:</strong></dt>
			<dd><strong>${emailBodyObject.total} $</strong> (usd)</dd>
		</dl>
		<br>
		<small style="color:#CCCCCC;">Order details end</small>
		<hr style="border:1px solid #999999">
		<p style="color:#666666"><strong>Thank you for choosing our food and services!</strong><br>
		- <i>The Pizza delivery team</i></p>
	`;


	if(to && subject && emailHtmlBody) {

		// configure payload
		const payload = {
			'from': 'Pizza delivery Order\'s <orders@pizza-delivery.food>',
			'to': to,
			'subject': subject,
			'html': emailHtmlBody
		}

		// Convert payload to string
		const payloadString = querystring.stringify(payload);

		// Configure request details
		const requestDetails = {
			'protocol':'https:',
			'hostname': 'api.mailgun.net',
			'method':'POST',
			'path':'/v3/'+config.mailgun.domain+'/messages',
			'headers': {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(payloadString),
				'Authorization':'Basic '+Buffer.from('api:'+config.mailgun.apiKey).toString('base64')
			}

		}

		// Instantiate request
		const req = https.request(requestDetails, function(res){

			// req status code
			const status = res.statusCode;

			if(status == 200 || status == 201) {
				callback(false);
			} else {
				callback('There was an error in email submission request, status code returned: '+status);
			}

		});

		// Request error hander
		req.on('error', function(e){
			callback(e);
		});

		// Make email
		req.write(payloadString);

		// End request
		req.end();

	} else {
		callback('Missing required parameters');
	}

};

// Export module
module.exports = helpers;





