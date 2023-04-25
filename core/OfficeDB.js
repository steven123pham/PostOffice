const DBConnection = require("./DBConnection");
const LocationDB = require("./LocationDB");
const connection = DBConnection.connection;
const mysql = require("mysql");

class PostOffice {
	constructor(sqlResult) {
		this.officeID = sqlResult.office_id;
		this.officeName = sqlResult.office_name;
		this.locationID = sqlResult.location_id;
	}
}

class Department {
	constructor(sqlResult) {
		this.departmentID = sqlResult.department_id;
		this.departmentName = sqlResult.department_name;
		this.officeID = sqlResult.office_id;
	}
}

exports.getAllPostOffices = async function() {
	const results = await connection.query("SELECT * FROM post_offices");
	let parsedResults = [];

	for (let i = 0; i < results.length; i++) {
		parsedResults.push(new PostOffice(results[i]));
	}

	return parsedResults;
}

exports.getAllPostOfficesFormatted = async function() {
	const results = await connection.query('SELECT PO.office_id AS officeID, PO.office_name AS officeName, L.formatted_name AS officeLocation FROM post_offices AS PO, locations AS L WHERE PO.location_id=L.location_id');
	return results;
}

exports.getAllDepartments = async function() {
	const results = await connection.query("SELECT * FROM departments");
	let parsedResults = [];

	for (let i = 0; i < results.length; i++) {
		parsedResults.push(new Department(results[i]));
	}

	return parsedResults;
}

exports.getAllDepartmentsFormatted = async function() {
	const results = await connection.query('SELECT D.department_id AS departmentID, D.department_name AS departmentName, PO.office_name AS officeName FROM departments AS D, post_offices AS PO WHERE D.office_id=PO.office_id');
	return results;
}

exports.getAllDepartmentsFormattedFromEmployeeID = async function(employeeID) {
	const officeID = (await exports.getPostOfficeFromEmployeeID(employeeID)).officeID;
	const results = await connection.query("SELECT D.department_id AS departmentID, D.department_name AS departmentName FROM departments AS D WHERE D.office_id=?", [officeID]);
	return results;
}

exports.getFormattedPostOfficeInfoFromEmployeeID = async function(employeeID) {
	const results = await connection.query("SELECT PO.office_id AS officeID, PO.office_name AS officeName FROM departments AS D, works_for_department AS WFD, post_offices AS PO WHERE WFD.employee_id=2 AND D.department_id=WFD.department_id AND PO.office_id=D.office_id", [employeeID]);
	return results;
}

exports.createPostOffice = async function(officeName, locationID) {
	const office_id = (await connection.query("INSERT INTO post_offices(office_name, location_id) VALUES (?, ?)", [officeName, locationID])).insertId;

	return {
		success: true,
		officeID: office_id
	};
}

exports.createDepartment = async function(departmentName, officeID) {
	const department_id = (await connection.query("INSERT INTO departments(department_name, office_id) VALUES (?, ?)", [departmentName, officeID]));

	return {
		success: true,
		departmentID: department_id
	};
}

exports.getPostOfficeAtLocationID = async function(locationID) {
	const results = await connection.query("SELECT * FROM post_offices WHERE location_id=?", [locationID]);

	if (results.length > 0)
		return new PostOffice(results[0]);
	else
		return null;
}

exports.getPostOfficeByName = async function(officeName) {
	const results = await connection.query("SELECT * FROM post_offices WHERE office_name=?", [officeName]);

	if (results.length > 0)
		return {
			success: true,
			office: new PostOffice(results[0])
		};
	else
		return {
			success: false,
		}
}

exports.getPostOfficeFromEmployeeID = async function(employeeID) {
	const result = await connection.query("SELECT PO.office_id AS officeID, L.formatted_name AS officeLocation, PO.office_name AS officeName FROM employees AS E, works_for_department AS WFD, departments AS D, post_offices AS PO, locations AS L WHERE E.employee_id=? AND WFD.employee_id=E.employee_id AND D.department_id=WFD.department_id AND PO.office_id=D.office_id AND L.location_id=PO.location_id", [employeeID]);

	// Either a post office or null
	return result[0];
}