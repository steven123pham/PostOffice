// EmployeeAuthDB
// Should be used for managing employee logins and account creation

const EmployeeNotificationsDB = require("./CustomerNotificationsDB");
const DBConnection = require("./DBConnection");
const connection = DBConnection.connection;
const mysql = require("mysql");
const crypto = require("crypto");

/*
	EMPLOYEES {
		employee_id (auto)
		first_name
		middle_init
		last_name
		ssn
		email
		salary
		phone_number
		ethnicity_id
		employee_username
		employee_pass_hash
		access_token
		employee_role_id
		supervisor_id
		deletion_date
		
		created_by
		created_at
		modified_by
		modified_at
	}
*/

// 15 minutes. Greatly exaggerated so that we can
exports.TIME_UNTIL_INVALID_TOKEN = 15 * 60 * 1000;

class Employee {
	constructor(dbResponse) {
		this.employeeID = dbResponse.employee_id;
		this.firstName = dbResponse.first_name;
		this.middleInit = dbResponse.middle_init;
		this.lastName = dbResponse.last_name;
		this.ssn = dbResponse.ssn;
		this.email = dbResponse.email;
		this.salary = dbResponse.salary;
		this.phoneNumber = dbResponse.phone_number;
		this.ethnicityID = dbResponse.ethnicity_id;
		this.employeeUsername = dbResponse.employee_username;
		this.employeePassHash = dbResponse.employee_pass_hash;
		this.accessToken = dbResponse.accessToken;
		this.employeeRoleID = dbResponse.employee_role_id;
		this.supervisorID = dbResponse.supervisor_id;
		this.deletionDate = dbResponse.deletion_date;
		this.createdBy = dbResponse.created_by;
		this.createdAt = dbResponse.created_at;
		this.modifiedBy = dbResponse.modified_by;
		this.modifiedAt = dbResponse.modified_at;
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

// Returns a 'Employee' object or null
exports.getEmployeeFromCookies = async function(cookies) {
	const accessToken = cookies.employee_access_token;
	if (!isAccessTokenValid(accessToken))
		return null;
	
	const results = await connection.query("SELECT * FROM employees WHERE access_token=?", [accessToken]);

	if (results.length == 1)
		return new Employee(results[0]);
	else
		return null;
}

// Returns a 'Employee' object
exports.logInAsEmployee = async function(username, password) {
	const passwordHash = crypto.createHash('sha256').update(password).digest('base64');
	const results = await connection.query("SELECT * FROM employees WHERE employee_username=? AND employee_pass_hash=?", [username, passwordHash]);

	if (results.length == 1) {
		const employeeData = results[0]
		const authToken = String(employeeData.employee_id) + "." + (Date.now() + exports.TIME_UNTIL_INVALID_TOKEN).toString();

		await connection.query("UPDATE employees SET access_token=? WHERE employee_id=?", [authToken, employeeData.employee_id]);
		return {
			success: true,
			accessToken: authToken
		}
	}
	else {
		return {
			success: false
		}
	}
}

// Returns an 'Employee' object or null
exports.getEmployeeFromUsername = async function(username) {
	const results = await connection.query("SELECT * FROM employees WHERE employee_username=?", [username]);

	if (results.length == 1)
		return new Employee(results[0]);
	else
		return null;
}

exports.getEmployeeFromEmployeeID = async function(employeeID) {
	const results = await connection.query("SELECT * FROM employees WHERE employee_id=?", [employeeID]);

	if (results.length == 1)
		return new Employee(results[0]);
	else
		return null;
}

exports.getEmployeesUnderSupervisorID = async function(supervisorID) {
	const supervisor_id = supervisorID.supervisorID
	const results = await connection.query("SELECT * FROM employees WHERE supervisor_id=? AND deletion_date IS NULL", [supervisor_id]);

	if (results.length > 0)
		return results;
	else
		return null;
}

exports.getDeletedEmployeesUnderSupervisorID = async function(supervisorID) {
	const supervisor_id = supervisorID.supervisorID
	const results = await connection.query("SELECT * FROM employees WHERE supervisor_id=? AND deletion_date IS NOT NULL", [supervisor_id]);

	if (results.length > 0)
		return results;
	else
		return null;
}

// `user` is the person who is creating this account
exports.createEmployee = async function(employeeInfo) {
	if (await exports.getEmployeeFromUsername(employeeInfo.employeeUsername) != null) {
		return {
			success: false,
			message: "Username is taken"
		}
	}

	if (employeeInfo.employeeRoleID > 2) {
		// This user does not have permission to create an account
		// 1: Admin
		// 2: Manager
		// ...

		EmployeeNotificationsDB.createNotificationByCustomerID(employeeInfo.supervisorID, `User ${employeeInfo.employeeID} attempted to create an account without permission.`);

		return {
			success: false,
			message: "You do not have permission to create an account. This action has been reported."
		}
	}

	const first_name = employeeInfo.firstName;
	const middle_init = employeeInfo.middleInit;
	const last_name = employeeInfo.lastName;
	const ssn = employeeInfo.ssn;
	const email = employeeInfo.email;
	const salary = employeeInfo.salary;
	const phone_number = employeeInfo.phoneNumber;
	const ethnicity_id = employeeInfo.ethnicityID;
	const employee_username = employeeInfo.employeeUsername;
	// hashing the password so that we don't store it directly
	const employee_pass_hash = crypto.createHash('sha256').update(employeeInfo.employeePassword).digest('base64');
	const employee_role_id = employeeInfo.roleID;
	const supervisor_id = employeeInfo.supervisorID;
	
	const created_by = employeeInfo.supervisorID;
	const modified_by = employeeInfo.supervisorID;

	const sql = mysql.format("INSERT INTO employees(first_name, middle_init, last_name, ssn, email, salary, phone_number, ethnicity_id, employee_username, employee_pass_hash, employee_role_id, supervisor_id, created_by, created_at, modified_by, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW())",
		[first_name, middle_init, last_name, ssn, email, salary, phone_number, ethnicity_id, employee_username, employee_pass_hash, employee_role_id, supervisor_id, created_by, modified_by]
	);
	
	const employee_id = (await connection.query(sql)).insertId;
	const insertedEmployee = await exports.getEmployeeFromEmployeeID(employee_id);

	return {
		success: true,
		employee: insertedEmployee
	};
}

exports.updateEmployeeInfoFromEmployeeID = async function(employeeInfo) {
	const employeeID = employeeInfo.employeeID;
	const first_name = employeeInfo.firstName;
	const middle_init = employeeInfo.middleInit;
	const last_name = employeeInfo.lastName;
	const ssn = employeeInfo.ssn;
	const email = employeeInfo.email;
	const salary = employeeInfo.salary;
	const phone_number = employeeInfo.phoneNumber;
	const ethnicity_id = employeeInfo.ethnicityID;
	const employee_role_id = employeeInfo.roleID;
	const supervisor_id = employeeInfo.supervisorID;
	
	const modified_by = employeeInfo.supervisorID;

	const sql = mysql.format ("UPDATE employees SET first_name=?, middle_init=?, last_name=?, ssn=?, email=?, salary=?, phone_number=?, ethnicity_id=?, employee_role_id=?, supervisor_id=?, modified_at=NOW() WHERE employee_id=?",
		[first_name, middle_init, last_name, ssn, email, salary, phone_number, ethnicity_id, employee_role_id, supervisor_id, employeeID]
	);
	
	const employee_id = (await connection.query(sql)).insertId;

	return {
		success: true,
		employee: await exports.getEmployeeFromEmployeeID(employee_id)
	};

}

// 'user' can be 
exports.updateEmployeeProfileFromEmployeeID = async function(employeeID, employeeInfo) {
	
	const existingEmployeeAtUsername = await exports.getEmployeeFromUsername(employeeInfo.employeeUsername);

	if (existingEmployeeAtUsername != null && existingEmployeeAtUsername.employeeID != employeeID) {
		return {
			success: false,
			message: "Username is taken"
		};
	}


	const first_name = employeeInfo.firstName;
	const middle_init = employeeInfo.middleInit;
	const last_name = employeeInfo.lastName;
	const ssn = employeeInfo.ssn;
	const email = employeeInfo.email;
	// const salary = employeeInfo.salary;
	const phone_number = employeeInfo.phoneNumber;
	const ethnicity_id = employeeInfo.ethnicityID;
	const employee_username = employeeInfo.employeeUsername;
	// hashing the password so that we don't store it directly
	const employee_pass_hash = crypto.createHash('sha256').update(employeeInfo.password).digest('base64');

	// const employee_role_id = employeeInfo.roleID;
	const supervisor_id = employeeInfo.supervisorID;
	
	const modified_by = employeeID;


	const sql = mysql.format("UPDATE employees SET first_name=?, middle_init=?, last_name=?, ssn=?, email=?, phone_number=?, ethnicity_id=?, employee_username=?, employee_pass_hash=?, supervisor_id=?, modified_at=NOW() WHERE employee_id=?",
		[first_name, middle_init, last_name, ssn, email, phone_number, ethnicity_id, employee_username, employee_pass_hash, supervisor_id, employeeID]
	);
	
	const employee_id = (await connection.query(sql)).insertId;


	return {
		success: true,
		employee: await exports.getEmployeeFromEmployeeID(employee_id)
	};

}


exports.removeEmployee = async function(employeeInfo) {

	const employee_id = employeeInfo.employeeID;

	if (employeeInfo.employeeRoleID > 2) {
		// This user does not have permission to delete an account
			// 1: Admin
			// 2: Manager
			// ...
	
		EmployeeNotificationsDB.createNotificationByCustomerID(employeeInfo.supervisorID, `User ${employeeInfo.employeeID} attempted to delete an account without permission.`);
	
		return {
			success: false,
			message: "You do not have permission to delete an account. This action has been reported."
		}
	}

	await connection.query("UPDATE employees SET deletion_date = CURDATE() WHERE employee_id=?", [employee_id]);

	return {
		success: true
	};
}

exports.retrieveEmployee = async function(employeeInfo) {

	const employee_id = employeeInfo.employeeID;

	if (employeeInfo.employeeRoleID > 2) {
		// This user does not have permission to delete an account
			// 1: Admin
			// 2: Manager
			// ...
	
		EmployeeNotificationsDB.createNotificationByCustomerID(employeeInfo.supervisorID, `User ${employeeInfo.employeeID} attempted to retrieve an account without permission.`);
	
		return {
			success: false,
			message: "You do not have permission to retrieve an account. This action has been reported."
		}
	}

	await connection.query("UPDATE employees SET deletion_date = NULL WHERE employee_id=?", [employee_id]);

	return {
		success: true
	};
}