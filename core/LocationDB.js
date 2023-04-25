// This module should manage the creating locations

const DBConnection = require("./DBConnection");
const connection = DBConnection.connection;
const mysql = require("mysql");

class Location {
	constructor(sqlResponse) {
		this.locationID = sqlResponse.location_id;
		this.street = sqlResponse.street;
		this.city = sqlResponse.city;
		this.stateCode = sqlResponse.state_code;
		this.postalCode = sqlResponse.postal_code;
		this.formattedName = sqlResponse.formatted_name;
	}
}

exports.createLocationID = async function(locationObj) {
	// Check if this location already exists
	// If it does, we return it
	const existingLocationID = await exports.getLocationIDFromInfo(locationObj);
	if (existingLocationID != null) {
		return {success: true, locationID: existingLocationID};
	}


	// Defining what we're inserting
	const formatted_name = locationObj.street + ", " + locationObj.city + ", " + locationObj.stateCode + " " + locationObj.postalCode;
	
	const street = locationObj.street;
	const city = locationObj.city;
	const state_code = locationObj.stateCode;
	const postal_code = locationObj.postalCode;
	
	// Actually insert it, and keep track of the insert ID
	const insertId = (await connection.query("INSERT INTO locations(formatted_name, street, city, state_code, postal_code) VALUES (?, ?, ?, ?, ?)", [formatted_name, street, city, state_code, postal_code])).insertId;

	const results = await connection.query("SELECT * FROM locations WHERE location_id=?", [insertId]);
	
	return {success: true, locationID: results[0].location_id};
}

exports.getLocationFromLocationID = async function(locationID) {
	const results = await connection.query("SELECT * FROM locations WHERE location_id=?", [locationID]);

	if (results.length == 1)
		return {success: true, location: new Location(results[0])};
	else
		return {success: false};
}

exports.getLocationFromCustomer = async function (customerID) {
	// SELECT given customer's location id
	const results = await connection.query("SELECT location_id FROM customers WHERE customer_id=?", [customerID]);

	if (results.length > 0)
		return new Location(results[0]);
	else
		return null
}

exports.getLocationFromOfficeID = async function (officeID) {
	// SELECT given post office's location id
	console.log("officeID " + officeID);
	const results = await connection.query("SELECT location_id FROM post_offices WHERE office_id=?", [officeID]);

	if (results.length > 0)
		return new Location(results[0]);
	else
		return null
}

exports.getLocationFromCourierID = async function(courierID) {
	// Super ugly SQL query
	const results = await connection.query("SELECT * FROM locations AS L, couriers AS C, departments AS D, post_offices AS P WHERE C.courier_id=? AND C.department_id=D.department_id AND D.office_id=P.office_id AND P.location_id=L.location_id", [courierID]);

	if (results.length == 0)
		return null;
	else
		return new Location(results);
}

exports.getLocationInfoFromLocationID = async function(locationID) {
	const results = await connection.query("SELECT * FROM locations WHERE location_id=?", [locationID]);

	if (results.length > 0)
		return new Location(results[0]);
	else
		return null;
}

exports.getLocationIDFromInfo = async function(locationObj) {
	/*
	locationInfo:
		{
			street,
			city,
			stateCode,
			postalCode
		}
	*/

	const street = locationObj.street;
	const city = locationObj.city;
	const state_code = locationObj.stateCode;
	const postal_code = locationObj.postalCode;

	const results = await connection.query("SELECT location_id FROM locations WHERE street=? AND city=? AND state_code=? AND postal_code=?", [street, city, state_code, postal_code]);

	if (results.length > 0)
		return results[0].location_id;
	else
		return null;
}