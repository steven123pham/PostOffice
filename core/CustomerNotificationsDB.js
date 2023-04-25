const DBConnection = require("./DBConnection");
const connection = DBConnection.connection;
const mysql = require("mysql");

class CustomerNotification {
	constructor(sqlResults) {
		this.customerNotificationID = sqlResults.customer_notification_id;
		this.customerID = sqlResults.customer_id;
		this.content = sqlResults.content;
		this.dateDismissed = sqlResults.date_dismissed;
		this.dateReceived = sqlResults.date_received;
	}
}

exports.getActiveNotificationsFromCustomerID = async function(customerID) {
	const results = await connection.query("SELECT * FROM customer_notifications WHERE customer_id=? AND date_dismissed IS NULL ORDER BY customer_notification_id DESC", [customerID]);
	let parsedResults = []
	
	for (let i = 0; i < results.length; i++) {
		parsedResults.push(new CustomerNotification(results[i]));
	}

	return parsedResults;
}

exports.getAllNotificationsFromCustomerID = async function(customerID) {
	const results = await connection.query("SELECT * FROM customer_notifications WHERE customer_id=?", [customerID]);
	let parsedResults = []
	
	for (let i = 0; i < results.length; i++) {
		parsedResults.push(new CustomerNotification(results[i]));
	}

	return parsedResults;
}

exports.dismissAllNotificationsFromCustomerID = async function(customerID) {
	await connection.query("UPDATE customer_notifications SET date_dismissed=NOW() WHERE customer_id=? AND date_dismissed IS NULL", [customerID])
}

exports.dismissNotificationByCustomerNotificationID = async function (customerNotificationID) {
	await connection.query("UPDATE customer_notifications SET date_dismissed=NOW() WHERE customer_notification_id=?", [customerNotificationID]);
}

exports.createNotificationByCustomerID = async function (customerID, content) {
	await connection.query("INSERT INTO customer_notifications(customer_id, content) VALUES (?, ?)", [customerID, content]);
}