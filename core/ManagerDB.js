const DBConnection = require("./DBConnection");
const LocationDB = require("./LocationDB");
const connection = DBConnection.connection;
const mysql = require("mysql");

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

class PossessesItem {
	constructor(sqlResult) {
		this.itemID = sqlResult.item_id;
		this.courierID = sqlResult.courierID;
		this.officeID = sqlResult.office_id;
	}
}

exports.getFormattedEmployeeCouriersAtPostOffice = async function(officeID) {
	const results = await connection.query('SELECT E.employee_id AS employeeID, CONCAT(E.first_name, " ", E.middle_init, " ", E.last_name) AS employeeName FROM employees AS E, departments AS D, works_for_department AS WFD WHERE D.office_id=? AND WFD.department_id=D.department_id AND E.employee_id=WFD.employee_id AND E.employee_role_id=3', [officeID]);
	return results;
}

exports.getManagedEmployeesFromEmployeeID = async function(supervisorID) {
	const results = await connection.query("SELECT * FROM employees WHERE supervisor=?", [supervisorID]);
	let parsedResults = [];

	for (let i = 0; i < results.length; i++) {
		parsedResults.push(new Employee(results[i]));
	}

	return parsedResults;
}

exports.removeEmployeeFromCourier = async function(employeeID) {
	await connection.query("DELETE FROM handles_courier WHERE employee_id=?", [employeeID]);
	return {
		success: true
	};
}

exports.assignEmployeeToCourier = async function(employeeID, courierID) {
	await exports.removeEmployeeFromCourier(employeeID);
	connection.query("INSERT INTO handles_courier(employee_id, courier_id) VALUES (?, ?)", [employeeID, courierID]);

	return {
		success: true
	};
}

exports.removeEmployeeFromDepartment = async function(employeeID) {
	await connection.query("DELETE FROM works_for_department WHERE employee_id=?", [employeeID]);
}

exports.assignEmployeeToDepartment = async function(employeeID, departmentID) {
	await exports.removeEmployeeFromDepartment(employeeID);
	connection.query("INSERT INTO works_for_department(employee_id, department_id) VALUES (?, ?)", [employeeID, departmentID]);

	return {
		success: true,
	};
}

exports.getActiveManagers = async function() {
	return await connection.query('SELECT E.employee_id AS managerID, CONCAT(E.first_name, " ", E.middle_init, " ", E.last_name) AS managerName, PO.office_name AS officeName, E.ssn AS ssn FROM employees AS E, works_for_department AS WFD, departments AS D, post_offices AS PO WHERE E.employee_role_id=2 AND E.deletion_date IS NULL AND E.employee_id=WFD.employee_id AND WFD.department_id=D.department_id AND D.office_id=PO.office_id');
}

exports.getInactiveManagers = async function() {
	return await connection.query('SELECT E.employee_id AS managerID, CONCAT(E.first_name, " ", E.middle_init, " ", E.last_name) AS managerName, PO.office_name AS officeName, E.ssn AS ssn FROM employees AS E, works_for_department AS WFD, departments AS D, post_offices AS PO WHERE E.employee_role_id=2 AND E.deletion_date IS NOT NULL AND E.employee_id=WFD.employee_id AND WFD.department_id=D.department_id AND D.office_id=PO.office_id');
}

exports.deactivateEmployee = async function(employeeID) {
	await connection.query('UPDATE employees SET deletion_date=CURRENT_DATE() WHERE employee_id=?', [employeeID]);

	return {
		success: true
	};
}

exports.recoverEmployee = async function(employeeID) {
	await connection.query('UPDATE employees SET deletion_date=NULL WHERE employee_id=?', [employeeID]);

	return {
		success: true
	};
}