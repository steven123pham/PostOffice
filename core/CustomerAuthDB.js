/*
	CUSTOMERS {
		customer_id
		location_id
		customer_phone_num
		customer_email
		customer_fname
		customer_minit
		customer_lname
		customer_username
		customer_passhash
		access_token
		deletion_date
		
		created_by
		created_at
		modified_by
		modified_at
	}
*/

const DBConnection = require("./DBConnection");
const LocationDB = require("./LocationDB");
const connection = DBConnection.connection;
const mysql = require("mysql");
const crypto = require("crypto");

class Customer {
	constructor(sqlResult) {
		this.customerID = sqlResult.customer_id;
		this.locationID = sqlResult.location_id;
		this.customerPhoneNum = sqlResult.customer_phone_num;
		this.customerEmail = sqlResult.customer_email;
		this.firstName = sqlResult.customer_fname;
		this.middleInit = sqlResult.customer_minit;
		this.lastName = sqlResult.customer_lname;
		this.customerUsername = sqlResult.customer_username;
		this.customerPassHash = sqlResult.customer_pass_hash;
		this.accessToken = sqlResult.access_token;
		this.deletionDate = sqlResult.deletion_date;

		this.createdBy = sqlResult.created_by;
		this.createdAt = sqlResult.created_at;
		this.modifiedBy = sqlResult.modified_by;
		this.modifiedAt = sqlResult.modified_at;
	}
}

// Returns true or false
// Validates the time ONLY. We can change this later to validate the user ID, but there's no need.
// Token Structure: USER_ID.VALID_UNTIL
//					int.int
function isAccessTokenValid(token) {
	if (token == null || token.indexOf(".") == -1) {
		// Not a valid token
		return false;
	}
	else {
		const parts = token.split(".");
		if (parts.length != 2 || Number(parts[1]) < Date.now()) {
			// The token expired, so it's invalid
			return false;
		}
		else {
			// Token expires in the future
			return true;
		}
	}
}

// 15 minutes. Greatly exaggerated so that we can
exports.TIME_UNTIL_INVALID_TOKEN = 15 * 60 * 1000;

exports.logInAsCustomer = async function(username, password) {
	const passwordHash = crypto.createHash('sha256').update(password).digest('base64');
	const results = await connection.query("SELECT * FROM customers WHERE customer_username=? AND customer_passhash=?", [username, passwordHash]);

	if (results.length == 1) {
		const customerData = results[0]
		const authToken = String(customerData.customer_id) + "." + (Date.now() + exports.TIME_UNTIL_INVALID_TOKEN).toString();
		
		await connection.query("UPDATE customers SET access_token=? WHERE customer_id=?", [authToken, customerData.customer_id]);
		return {
			success: true,
			accessToken: authToken
		};
	}
	else {
		return {
			success: false,
			message: "Log in failed; please check your username and password."
		};
	}
}

//Checks if customer exist through phonenumber

exports.getCustomerFromPhoneNumber = async function(phonenumber) {
	const results = await connection.query("SELECT * FROM customers WHERE customer_phone_num=?", [phonenumber]);
	// console.log(results);
	if (results.length == 1) {
		const customerData = results[0]
		const authToken = String(customerData.customer_id) + "." + (Date.now() + exports.TIME_UNTIL_INVALID_TOKEN).toString();
		
		await connection.query("UPDATE customers SET access_token=? WHERE customer_id=?", [authToken, customerData.customer_id]);
		return {
			success: true,
			accessToken: authToken
		};
	}
	else {
		return {
			success: false,
			message: "Log in failed; please check your username and password."
		};
	}	
}
// Returns a 'Employee' object or null
exports.getCustomerFromCookies = async function(cookies) {
	const accessToken = cookies.customer_access_token;
	if (!isAccessTokenValid(accessToken))
		return null;
	
	const results = await connection.query("SELECT * FROM customers WHERE access_token=?", [accessToken]);

	if (results.length == 1)
		return new Customer(results[0]);
	else
		return null;
}

exports.getCustomerFromUsername = async function(username) {
	const results = await connection.query("SELECT * FROM customers WHERE customer_username=?", [username]);

	if (results.length == 1)
		return new Customer(results[0]);
	else
		return null;
}

exports.getCustomerFromCustomerID = async function(customerID) {
	const results = await connection.query("SELECT * FROM customers WHERE customer_id=?", [customerID]);
	
	if (results.length == 1)
		return new Customer(results[0]);
	else
		return null;
}

exports.getCustomerFromLocationID = async function(locationID) {
	const results = await connection.query("SELECT * FROM customers WHERE location_id=?", [locationID]);

	if (results.length > 0)
		return new Customer(results[0]);
	else
		return null;
}

exports.createCustomer = async function(customerInfo) {
	if (await exports.getCustomerFromUsername(customerInfo.customerUsername) != null) {
		return {
			success: false,
			message: "Username is taken"
		};
	}

	const location_id = (await LocationDB.createLocationID(customerInfo.location)).locationID;

	const customer_phone_num = customerInfo.customerPhoneNum;
	const customer_email = customerInfo.customerEmail;
	const customer_fname = customerInfo.firstName;
	const customer_minit = customerInfo.middleInit;
	const customer_lname = customerInfo.lastName;
	const customer_username = customerInfo.customerUsername;
	const customer_pass_hash = crypto.createHash('sha256').update(customerInfo.customerPassword).digest('base64');
	const access_token = null;
	const deletion_date = Date.parse("2000-1-1");
	
	const created_by = 1;
	const modified_by = 1;
	
	const sql = mysql.format("INSERT INTO customers(location_id, customer_phone_num, customer_email, customer_fname, customer_minit, customer_lname, customer_username, customer_passhash, access_token, created_by, created_at, modified_by, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW())",
		[location_id, customer_phone_num, customer_email, customer_fname, customer_minit, customer_lname, customer_username, customer_pass_hash, access_token, created_by, modified_by]
	);
	
	const customer_id = (await connection.query(sql)).insertId;

	return {
		success: true,
		customer: await exports.getCustomerFromCustomerID(customer_id)
	};
}

exports.updateCustomerFromCustomerID = async function(customerID, customerInfo) {
	const existingCustomerAtUsername = await exports.getCustomerFromUsername(customerInfo.customerUsername);
	if (existingCustomerAtUsername != null && existingCustomerAtUsername.customerID != customerID) {
		return {
			success: false,
			message: "Username is taken"
		};
	}

	const location_id = await (await LocationDB.createLocationID(customerInfo.location)).locationID;
	const customer_phone_num = customerInfo.customerPhoneNum;
	const customer_email = customerInfo.customerEmail;
	const customer_fname = customerInfo.firstName;
	const customer_minit = customerInfo.middleInit;
	const customer_lname = customerInfo.lastName;
	const customer_username = customerInfo.customerUsername;
	const customer_passhash = crypto.createHash('sha256').update(customerInfo.customerPassword).digest('base64');
	const access_token = null;
	const deletion_date = Date.parse("2000-1-1");
	
	const created_by = 1;
	const modified_by = 1;
	
	const sql = mysql.format("UPDATE customers SET location_id=?, customer_phone_num=?, customer_email=?, customer_fname=?, customer_minit=?, customer_lname=?, customer_username=?, customer_passhash=?, modified_at=NOW() WHERE customer_id=?",
		[location_id, customer_phone_num, customer_email, customer_fname, customer_minit, customer_lname, customer_username, customer_passhash, modified_by, customerID]
	);
	
	const customer_id = (await connection.query(sql)).insertId;

	return {
		success: true,
		customer: await exports.getCustomerFromCustomerID(customer_id)
	};
}