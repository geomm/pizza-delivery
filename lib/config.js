/*
 * Create and export configuration variables
 *
 */

// Config object instantiation
const environments = {};

// Staging environment
environments.staging = {
	'httpPort': 5000,
	'httpsPort': 5443,
	'envName': 'staging',
	'hashingSecret' : 'somethingSecretHere',
	'stripe' :{
		'publicKey':'xx_xxxx_xxxxxxxxxxxxxxxxxxxxxxxxx',
		'secretKey':'xx_xxxx_xxxxxxxxxxxxxxxxxxxxxxxxx'
	},
	'mailgun':{
		'apiKey':'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx-xxxxxxxx',
		'domain':'sandboxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.mailgun.org'
	}
}

// Production environment
environments.production = {
	'httpPort': 7000,
	'httpsPort': 7443,
	'envName': 'production',
	'hashingSecret' : 'somethingSecretHere',
	'stripe' :{
		'secretKey':''
	},
	'mailgun':{
		'apiKey':'',
		'domain':''
	}
}

// Determine the environment that was passed as a command line argument
const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that current environment is one of the above, if not switch to staging environment
const environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export module
module.exports = environmentToExport;