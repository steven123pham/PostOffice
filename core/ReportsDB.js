const DBConnection = require("./DBConnection");
const LocationDB = require("./LocationDB");
const connection = DBConnection.connection;
const mysql = require("mysql");

exports.getUnfilteredRevenue = async function() {


	const results = await connection.query("SELECT expiration_date, items.item_id, items.item_type_id, sends_item.customer_id AS sender_id, sender.customer_fname AS sender_fname, sender.customer_minit AS sender_minit, sender.customer_lname AS sender_lname, receives_item.customer_id AS recipient_id, recipient.customer_fname AS recipient_fname, recipient.customer_minit AS recipient_minit, recipient.customer_lname AS recipient_lname, amount_paid FROM items, sends_item, receives_item, customers AS sender, customers AS recipient WHERE (receives_item.item_id = items.item_id) AND (sends_item.item_id = items.item_id) AND (sends_item.customer_id = sender.customer_id) AND (receives_item.customer_id = recipient.customer_id)");

	if (results.length > 0)
		return {
			success: true,
			reports: results
		};
	else
		return {
			success: false,
		}
}

exports.getUnfilteredTotalRevenue = async function() {

    const results = await connection.query("SELECT SUM(amount_paid) AS total_revenue FROM db.items, db.sends_item, db.receives_item, db.customers AS sender, db.customers AS recipient WHERE (receives_item.item_id = items.item_id) AND (sends_item.item_id = items.item_id) AND (sends_item.customer_id = sender.customer_id) AND (receives_item.customer_id = recipient.customer_id);");

    if (results.length > 0)
		return {
			success: true,
			reports: results[0]
		};
	else
		return {
			success: false,
		}
}

exports.getFilteredRevenueByDate = async function(dates) {

	const startDate = dates.fromDate;
	const endDate = dates.toDate;

	const results = await connection.query("SELECT expiration_date, items.item_id, items.item_type_id, sends_item.customer_id AS sender_id, sender.customer_fname AS sender_fname, sender.customer_minit AS sender_minit, sender.customer_lname AS sender_lname, receives_item.customer_id AS recipient_id, recipient.customer_fname AS recipient_fname, recipient.customer_minit AS recipient_minit, recipient.customer_lname AS recipient_lname, amount_paid FROM items, sends_item, receives_item, customers AS sender, customers AS recipient WHERE (receives_item.item_id = items.item_id) AND (sends_item.item_id = items.item_id) AND (sends_item.customer_id = sender.customer_id) AND (receives_item.customer_id = recipient.customer_id) AND (expiration_date >= ?) AND (expiration_date <= ?)", [startDate, endDate]);

    return {
		success: true,
		reports: results
	};
}

exports.getFilteredTotalRevenueByDate = async function(dates) {
	
	const startDate = dates.fromDate;
	const endDate = dates.toDate;

	const results = await connection.query("SELECT SUM(amount_paid) AS total_revenue FROM db.items, db.sends_item, db.receives_item, db.customers AS sender, db.customers AS recipient WHERE (receives_item.item_id = items.item_id) AND (sends_item.item_id = items.item_id) AND (sends_item.customer_id = sender.customer_id) AND (receives_item.customer_id = recipient.customer_id) AND (expiration_date >= ?) AND (expiration_date <= ?)", [startDate, endDate]);

    if (results.length > 0)
		return {
			success: true,
			reports: results[0]
		};
	else
		return {
			success: false,
		}

}

exports.getFilteredRevenueByDateAndSender = async function(filters) {

	const startDate = filters.fromDate;
	const endDate = filters.toDate;
	const senderID = filters.senderID

	const results = await connection.query("SELECT expiration_date, items.item_id, items.item_type_id, sends_item.customer_id AS sender_id, sender.customer_fname AS sender_fname, sender.customer_minit AS sender_minit, sender.customer_lname AS sender_lname, receives_item.customer_id AS recipient_id, recipient.customer_fname AS recipient_fname, recipient.customer_minit AS recipient_minit, recipient.customer_lname AS recipient_lname, amount_paid FROM items, sends_item, receives_item, customers AS sender, customers AS recipient WHERE (receives_item.item_id = items.item_id) AND (sends_item.item_id = items.item_id) AND (sends_item.customer_id = sender.customer_id) AND (receives_item.customer_id = recipient.customer_id) AND (expiration_date >= ?) AND (expiration_date <= ?) AND (sends_item.customer_id = ?)", [startDate, endDate, senderID]);

    return {
		success: true,
		reports: results
	};

}

exports.getFilteredTotalRevenueByDateAndSender =async function(filters) {

	const startDate = filters.fromDate;
	const endDate = filters.toDate;
	const senderID = filters.senderID

	const results = await connection.query("SELECT SUM(amount_paid) AS total_revenue FROM items, sends_item, receives_item, customers AS sender, customers AS recipient WHERE (receives_item.item_id = items.item_id) AND (sends_item.item_id = items.item_id) AND (sends_item.customer_id = sender.customer_id) AND (receives_item.customer_id = recipient.customer_id) AND (expiration_date >= ?) AND (expiration_date <= ?) AND (sends_item.customer_id = ?)", [startDate, endDate, senderID]);

    if (results.length > 0)
		return {
			success: true,
			reports: results[0]
		};
	else
		return {
			success: false,
		}

}

exports.getFilteredRevenueByDateAndItemType = async function(filters) {

	const startDate = filters.fromDate;
	const endDate = filters.toDate;
	const itemType = filters.itemType

	const results = await connection.query("SELECT expiration_date, items.item_id, items.item_type_id, sends_item.customer_id AS sender_id, sender.customer_fname AS sender_fname, sender.customer_minit AS sender_minit, sender.customer_lname AS sender_lname, receives_item.customer_id AS recipient_id, recipient.customer_fname AS recipient_fname, recipient.customer_minit AS recipient_minit, recipient.customer_lname AS recipient_lname, amount_paid FROM db.items, db.sends_item, db.receives_item, db.customers AS sender, db.customers AS recipient WHERE (receives_item.item_id = items.item_id) AND (sends_item.item_id = items.item_id) AND (sends_item.customer_id = sender.customer_id) AND (receives_item.customer_id = recipient.customer_id) AND (expiration_date >= ?) AND (expiration_date <= ?) AND (items.item_type_id = ?)", [startDate, endDate, itemType]);

	return {
		success: true,
		reports: results
	};

}

exports.getFilteredTotalRevenueByDateAndItemType = async function(filters) {

	const startDate = filters.fromDate;
	const endDate = filters.toDate;
	const itemType = filters.itemType

	const results = await connection.query("SELECT SUM(amount_paid) AS total_revenue FROM items, sends_item, receives_item, customers AS sender, customers AS recipient WHERE (receives_item.item_id = items.item_id) AND (sends_item.item_id = items.item_id) AND (sends_item.customer_id = sender.customer_id) AND (receives_item.customer_id = recipient.customer_id) AND (expiration_date >= ?) AND (expiration_date <= ?) AND (items.item_type_id = ?)", [startDate, endDate, itemType]);

    if (results.length > 0)
		return {
			success: true,
			reports: results[0]
		};
	else
		return {
			success: false,
		}

}

exports.getAllFilteredRevenue = async function(filters) {

	const startDate = filters.fromDate;
	const endDate = filters.toDate;
	const senderID = filters.senderID;
	const itemType = filters.itemType

	const results = await connection.query("SELECT expiration_date, items.item_id, items.item_type_id, sends_item.customer_id AS sender_id, sender.customer_fname AS sender_fname, sender.customer_minit AS sender_minit, sender.customer_lname AS sender_lname, receives_item.customer_id AS recipient_id, recipient.customer_fname AS recipient_fname, recipient.customer_minit AS recipient_minit, recipient.customer_lname AS recipient_lname, amount_paid FROM db.items, db.sends_item, db.receives_item, db.customers AS sender, db.customers AS recipient WHERE (receives_item.item_id = items.item_id) AND (sends_item.item_id = items.item_id) AND (sends_item.customer_id = sender.customer_id) AND (receives_item.customer_id = recipient.customer_id) AND (expiration_date >= ?) AND (expiration_date <= ?) AND (items.item_type_id = ?) AND (sends_item.customer_id = ?)", [startDate, endDate, itemType, senderID]);

	return {
		success: true,
		reports: results
	};

}

exports.getAllFilteredTotalRevenue = async function(filters) {

	const startDate = filters.fromDate;
	const endDate = filters.toDate;
	const senderID = filters.senderID;
	const itemType = filters.itemType

	const results = await connection.query("SELECT SUM(amount_paid) AS total_revenue FROM db.items, db.sends_item, db.receives_item, db.customers AS sender, db.customers AS recipient WHERE (receives_item.item_id = items.item_id) AND (sends_item.item_id = items.item_id) AND (sends_item.customer_id = sender.customer_id) AND (receives_item.customer_id = recipient.customer_id) AND (expiration_date >= ?) AND (expiration_date <= ?) AND (items.item_type_id = ?) AND (sends_item.customer_id = ?)", [startDate, endDate, itemType, senderID]);

	return {
		success: true,
		reports: results[0]
	};
}
  
  exports.getItemReports = async function(fromDate, toDate, groupBy) {
	if (groupBy == "Post Office") {
		const results = await connection.query("SELECT COUNT(IL.item_id) as itemCount, PO.office_name as officeName, PO.office_id AS officeID, AVG(I.cost_to_send) AS averageCost FROM items AS I, item_logs AS IL, post_offices AS PO WHERE IL.il_status_id=5 AND I.item_id=IL.item_id AND IL.location_id=PO.location_id AND IL.log_timestamp>=? AND IL.log_timestamp<=? GROUP BY officeName", [fromDate, toDate]);
		return results;
	}
	else {
		// "Item Type"
		const results = connection.query("SELECT IT.item_type_name AS itemType, COUNT(I.item_id) AS itemCount, AVG(I.cost_to_send) AS averageCost FROM items AS I, item_logs AS IL, item_types AS IT WHERE IL.log_timestamp>? AND IL.log_timestamp<? AND IL.item_id=I.item_id AND I.item_type_id=IT.item_type_id GROUP BY itemType", [fromDate, toDate]);
		
		return results;
	}
}

exports.getCourierReports = async function(fromDate, toDate, byStatus) {
	const results = await connection.query("SELECT UIL.courier_id AS courierID, C.courier_name AS courierName, COUNT(IL.item_id) AS itemCount FROM item_logs AS IL, updates_item_log AS UIL, couriers AS C, item_log_statuses AS ILS WHERE ILS.il_status_name=? AND ILS.il_status_id=IL.il_status_id AND UIL.item_log_id=IL.item_log_id AND C.courier_id=UIL.courier_id AND IL.log_timestamp>? AND IL.log_timestamp<? GROUP BY courierID", [byStatus, fromDate, toDate]);

	return results;

}