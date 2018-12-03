/*
 * Helpers methods for various tasks
 *
 */

// Dependencies
const crypto = require('crypto');
const config = require('./config');

const https = require('https'); // Stripe API, Mailgun API
const querystring = require('querystring') // Stripe API, Mailgun API
const StringDecoder = require('string_decoder').StringDecoder; // Mailgun API

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
// Requires shoppingCart
helpers.submitStripePayment = function(shoppingCart, callback){

	const email = typeof(shoppingCart.email) == 'string' && shoppingCart.email.trim().length > 0 && shoppingCart.email.trim().match('@').length == 1 && shoppingCart.email.trim().match('.').length >= 1 && shoppingCart.email.trim().match(new RegExp(/\w+@\w+\.\w+/g)) != null ? shoppingCart.email.trim() : false;	

	// User's new order ontainer for passing to history
	let orderPassingToHistory = {};

	shoppingCart = typeof(shoppingCart) == 'object' ? shoppingCart : {};

	if(email && shoppingCart) {

		// Stripe API - convert to smallest currency unit dollars * 100 (cents)
		const totalCost = parseFloat(shoppingCart.total).toFixed(2) * 100;
		// Stringify shoppingCart to pass it to Mailgun function
		const cartString = JSON.stringify(shoppingCart);

		// Configure payload
		const payload = {
			'amount': parseInt(totalCost),
			'currency':'usd',
			'description':'Pizza delivery API payment',
			'source': 'tok_visa',
			'receipt_email': email,
			'metadata': {}
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

		// Response body container
		let responseBody = {};

		// Instantiate the request object
		const req = https.request(requestDetails, function(res){

			// response status
			const status = res.statusCode;

			// Callback regarding the status code returned
			if(status == 200 || status == 201) {
				
				// Set response body encoding
				res.setEncoding('utf8');
				// On response body
				res.on('data', function(chargeData){
					// Store response body
					responseBody = helpers.parseJsonToObject(chargeData);
				});

				res.on('end', function(){
					
					responseBody = typeof(responseBody) == 'object' ? responseBody : false;
					
					if(responseBody){

						// Bellow, collect charge.paid, charge.status, charge.id (to store this in user's orderHistory collection)
						const stripePaid = typeof(responseBody.paid) == 'boolean' ? responseBody.paid : false;
						const stripeStatus = typeof(responseBody.status) == 'string' ? responseBody.status : false;

						// Make sure that the Stripe charge returns paid: true, status: SUCCEEDED
						if (stripePaid && stripeStatus) {
							// Stripe charge id
							const stripeChargeId = typeof(responseBody.id) == 'string' && responseBody.id.match(/^ch_+/g) != null ? responseBody.id : false;

							// Send email receipt using Mailgun API
							helpers.sendMailgunEmailReceipt(email, 'Pizza delivery - Payment completed', cartString, function(err, mailgunResp){
								if(!err && mailgunResp) {

									// Mailgun email id
									const mailgunEmailId = typeof(mailgunResp.id) == 'string' && mailgunResp.id.match(/mailgun\.org>$/g) != null ? mailgunResp.id : false;

									orderPassingToHistory[`${shoppingCart.cartId}`] = {
										'stripeChargeId' : stripeChargeId,
										'mailgunEmailId' : mailgunEmailId
									};

									callback(false, orderPassingToHistory);

								} else {

									callback(503, {'Error':'There was a problem sending email receipt'})

								}
							});

						}

					}
				});
				
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

	const emailBodyObject = helpers.parseJsonToObject(content);

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
		- <i>The Pizza delivery service</i></p>
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

		// Response body container
		let responseBody = {};

		// Instantiate request
		const req = https.request(requestDetails, function(res){

			// req status code
			const status = res.statusCode;

			if(status == 200 || status == 201) {
				
				// Set response body encoding
				res.setEncoding('utf8');
				// On response body
				res.on('data', function(chunk){
					// Store response body
					responseBody = helpers.parseJsonToObject(chunk);
				});
				// On response end
				res.on('end', function(){
					responseBody = typeof(responseBody) == 'object' ? responseBody : false;
					
					if(responseBody){
						// If response is ok pass mailgun response body object to the callback
						callback(false, responseBody);					
					}
				});

			} else {
				callback(status, {'Error':'There was an error in email submission request, status code returned: '+status });
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


// Track email using Mailgun's Events API
helpers.trackMailgunEmail = function(emailId, callback) {
	
	// Accepted Mailgun email Events
	const mailgunAcceptedEvents = ['accepted', 'delivered', 'failed'];
	// Run per minute
	const trackInterval = setInterval(function(){
		// Get email events
		helpers.getMailgunEmailEvents(emailId, function(mailgunEvents){

			if(mailgunEvents){				
				// For each email event
				mailgunEvents.items.forEach( (item, index) => {
					
					// If email receipt is delivered
					if(mailgunAcceptedEvents.indexOf(item.event) > -1 && mailgunAcceptedEvents.indexOf(item.event) === 1){
						// Stop getting email events
						clearInterval(trackInterval);
						callback(item.event);
					} else if(mailgunAcceptedEvents.indexOf(item.event) == -1 && item.event === 'rejected' ) {
						// In case the email address doesn't exists (this shoudn't ment to happen - user tosAgreement could happen through email verification)
						// Stop getting email events
						clearInterval(trackInterval);
						callback(item.event);
					} else {
						return;
					}
					
				});
			}
		});
	}, 1000*60);

};


/* Get email events for id:emailId */
helpers.getMailgunEmailEvents = function(emailId, callback){

		// Remove <> from email id
		const messageId = emailId.replace('<','').replace('>','');

		// Configure request event details
		const eventsRequestDetails = {
			'protocol':'https:',
			'hostname': 'api.mailgun.net',
			'method':'GET',
			'path':'/v3/'+config.mailgun.domain+'/events?message-id='+messageId,
			'headers': {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization':'Basic '+Buffer.from('api:'+config.mailgun.apiKey).toString('base64')
			}

		}

		// Mailgun events container
		let eventsResponseBody = {};

		// Events request
		const evReq = https.request(eventsRequestDetails, function(evRes){

			// create string decoder to parse the payload using it
			let decoder = new StringDecoder('utf-8');
			let buffer = '';

			// Get status
			const resStatus = evRes.statusCode;

			// If status OK
			if(resStatus == 200 || resStatus == 201) {

				evRes.on('data', function(mailgunEvents){
					buffer += decoder.write(mailgunEvents);
				});
				evRes.on('end', function(){
					buffer += decoder.end();

					eventsResponseBody = helpers.parseJsonToObject(buffer);

					if(eventsResponseBody) {
						callback(eventsResponseBody);
					}

				});

			} else {
				callback('Could not get email Events, status'+resStatus);
			}
		});

		// Request error hander
		evReq.on('error', function(e){
			callback(e);
		});

		// Write data to request body
		evReq.write('data\n');

		// End request
		evReq.end();

};


// Export module
module.exports = helpers;