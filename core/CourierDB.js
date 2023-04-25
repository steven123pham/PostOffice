const DBConnection = require("./DBConnection");
const LocationDB = require("./LocationDB");
const OfficeDB = require("./OfficeDB");
const connection = DBConnection.connection;
const mysql = require("mysql");

class Courier {
	constructor(sqlResult) {
		this.courierID = sqlResult.courier_id;
		this.courierName = sqlResult.courier_name;
		this.courierTypeID = sqlResult.courier_type_id;
        this.departmentID = sqlResult.department_id;
	}
}

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

exports.getAllCouriers = async function() {
	const results = await connection.query("SELECT * FROM couriers");
	let parsedResults = [];

	for (let i = 0; i < results.length; i++) {
		parsedResults.push(new Courier(results[i]));
	}

	return parsedResults;
}

exports.getAllCouriersFormatted = async function() {
	const results = await connection.query('SELECT C.courier_id AS courierID, CONCAT(C.courier_name, " (", PO.office_name, ")") AS descriptiveName FROM couriers AS C, departments AS D, post_offices AS PO WHERE C.department_id=D.department_id AND D.office_id=PO.office_id');
	return results;
}

exports.getCourierIDFromEmployeeID = async function(employeeID) {
	const results = await connection.query("SELECT * FROM handles_courier WHERE employee_id=?", [employeeID]);

	if (results.length > 0)
		return results[0].courier_id;
	else
		return null;
}

exports.getFormattedItemsHeldByEmployeeID = async function(employeeID) {
	const courierID = await exports.getCourierIDFromEmployeeID(employeeID);
	if (courierID == null) {
		return {
			success: false,
			message: "This employee does not work in a courier. Please ask a manager to assign you to a courier."
		};
	}
	const results = await connection.query("SELECT I.item_id AS itemID, L.formatted_name AS destinationLocation FROM items AS I, possesses_item AS PI, locations AS L WHERE PI.courier_id=? AND PI.item_id=I.item_id AND L.location_id=I.destination_location_id", [courierID]);

	return {
		success: true,
		items: results
	};
}

exports.getFormattedCouriersAtPostOfficeFromEmployeeID = async function(employeeID) {
	const officeID = (await OfficeDB.getPostOfficeFromEmployeeID(employeeID)).officeID;
	const results = await connection.query("SELECT C.courier_id AS courierID, C.courier_name AS courierName, CT.courier_type_name AS courierType FROM couriers AS C, departments AS D, courier_types AS CT WHERE D.office_id=? AND C.department_id=D.department_id AND CT.courier_type_id=C.courier_type_id", [officeID]);

	return results;
}

exports.getFormattedAssignedCouriersAtPostOfficeFromEmployeeID = async function(employeeID) {
	const officeID = (await OfficeDB.getPostOfficeFromEmployeeID(employeeID)).officeID;
	const results = await connection.query('SELECT E.employee_id AS employeeID, CONCAT(E.first_name, " ", E.middle_init, " ", E.last_name) AS employeeName, C.courier_id AS courierID, C.courier_name AS courierName FROM handles_courier AS HC, employees AS E, couriers AS C, departments AS D, works_for_department AS WFD WHERE D.office_id=? AND WFD.department_id=D.department_id AND E.employee_id=WFD.employee_id AND HC.employee_id=E.employee_id AND HC.courier_id=C.courier_id', [officeID]);

	return results;
}

exports.createCourier = async function(courierName, courierTypeID, departmentID) {
	await connection.query("INSERT INTO couriers(courier_name, courier_type_id, department_id) VALUES (?, ?, ?)", [courierName, courierTypeID, departmentID]);

	return {
		success: true
	};
}