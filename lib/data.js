/*
 * Library for storing and editing data to a file
 *
 */

// Dependencies
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// Instatiate module container
const lib = {};

// Base dir for data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// Write data to a file
lib.create = function(dir, file, data, callback){
	// Open file
	fs.open(lib.baseDir+dir+'/'+file+'.json','wx', function(err, fileDescriptor){
		if(!err && fileDescriptor){
			
			// Convert data to a string
			const stringData = JSON.stringify(data);
			
			// Write data to the file
			fs.write(fileDescriptor, stringData, function(err){
				if(!err) {
					// Added fs.close because node process was preventing from deleting the files,
					// when lib.delete was called, on my system
					fs.close(fileDescriptor, function(err){
						if(!err) {
							callback(false);
						} else {
							callback('Error closing the new file');
						}
					});
				} else {
					callback(400, {'Error':'There was a problem writing to the file created'});
				}
				
			});

		} else {
			callback(400, {'Error':'There was a problem creating the file. The file might already exists.'});
		}
	});
};

// Read file data
lib.read = function(dir, file, callback){
	// Open file
	fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf-8', function(err, fileData){ // Mental note on that one
		if(!err && fileData) {
			const parsedFileData = helpers.parseJsonToObject(fileData);
			callback(false, parsedFileData);
		} else {
			callback(err, fileData);
		}
	});

};

// Edit/update file data
lib.update = function(dir, file, newData, callback){
	fs.open(lib.baseDir+dir+'/'+file+'.json','r+', function(err, fileDescriptor){
		if(!err && fileDescriptor){
			
			// Convert data to a string
			let stringNewData = JSON.stringify(newData);
			
			fs.truncate(fileDescriptor, function(err){
				if(!err) {
					// Write new data to the file
					fs.writeFile(fileDescriptor, stringNewData, function(err){
						if(!err) {
							fs.close(fileDescriptor, function(err){
								if(!err) {
									callback(false);
								} else {
									callback('Error closing existing file');
								}
							});
						}
					});
				}
			});

		} else {
			callback(400, {'Error':'There was a problem opening the file for update. It might not exist yet.'});
		}
	});
};

// Delete file
lib.delete = function(dir, file, callback){
	// Unlink file (delete)
	fs.unlink(lib.baseDir+dir+'/'+file+'.json', function(err){
		if(!err) {
			callback(false);
		} else {
			callback('Error deleting the file');
		}
	});
};

// List all the items in a directory
lib.list = function(dir, callback){
	fs.readdir(lib.baseDir+dir+'/', function(err, dirData){
		if(!err && dirData && dirData.length > 0) {
			const trimmedFileNames = [];
			dirData.forEach(function(fileName){
				trimmedFileNames.push(fileName.replace('.json', ''));
			});
			callback(false, trimmedFileNames);
		} else {
			callback(err, dirData);
		}
	});
};


// Export module
module.exports = lib