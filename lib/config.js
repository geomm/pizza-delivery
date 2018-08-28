/*
 * Create and export configuration variables
 *
 */

// Config object instantiation
const environments = {};

// Staging environment
environments.staging = {
	'httpPort': 5000,
	'envName': 'staging'
}

// Production environment
environments.production = {
	'httpPort': 7000,
	'envName': 'production'
}

// Determine the environment that was passed as a command line argument
const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that current environment is one of the above, if not switch to staging environment
const environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export module
module.exports = environmentToExport;