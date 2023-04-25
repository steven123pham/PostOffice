const DBConnection = require("./DBConnection");
const connection = DBConnection.connection;
const mysql = require("mysql");

class employeeNotification {
	constructor(sqlResults) {
		this.employeeNotificationID = sqlResults.employee_notification_id;
		this.employeeID = sqlResults.employee_id;
		this.content = sqlResults.content;
		this.dateDismissed = sqlResults.date_dismissed;
		this.dateReceived = sqlResults.date_received;
	}
}

exports.getActiveNotificationsFromEmployeeID = async function(employeeID) {
	const results = await connection.query("SELECT * FROM employee_notifications WHERE employee_id=? AND date_dismissed IS NULL", [employeeID]);
	let parsedResults = []
	
	for (let i = 0; i < results.length; i++) {
		parsedResults.push(new employeeNotification(results[i]));
	}

	return parsedResults;
}

exports.getAllNotificationsFromEmployeeID = async function(employeeID) {
	const results = await connection.query("SELECT * FROM employee_notifications WHERE employee_id=?", [employeeID]);
	let parsedResults = []
	
	for (let i = 0; i < results.length; i++) {
		parsedResults.push(new employeeNotification(results[i]));
	}

	return parsedResults;
}

exports.dismissAllNotificationsFromEmployeeID = async function(employeeID) {
	await connection.query("UPDATE employee_notifications SET date_dismissed=NOW() WHERE employee_id=?", [employeeID])
}

exports.dismissNotificationByemployeeNotificationID = async function (employeeNotificationID) {
	await connection.query("UPDATE employee_notifications SET date_dismissed=NOW() WHERE employee_notification_id=?", [employeeNotificationID]);
}

exports.createNotificationByemployeeID = async function (employeeID, content) {
	await connection.query("INSERT INTO employee_notifications(employee_id, content) VALUES (?, ?)", [employeeID, content]);
}