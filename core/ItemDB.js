const CustomerAuthDB = require("./CustomerAuthDB");
const LocationDB = require("./LocationDB");
const CourierDB = require("./CourierDB");
const OfficeDB = require("./OfficeDB");

const DBConnection =  require("./DBConnection");
const connection = DBConnection.connection;
const mysql = require("mysql");

class Item {
    constructor(dbResponse) {
        this.itemID = dbResponse.item_id;
        this.itemTypeID = dbResponse.item_type_id;
        this.width = dbResponse.dim_width;
        this.height = dbResponse.dim_height;
        this.length = dbResponse.dim_length;
        this.expirationDate = dbResponse.expiration_date;
        this.costToSend = dbResponse.cost_to_send;
        this.amountPaid = dbResponse.amount_paid;
        this.priorityID = dbResponse.priority_type_id;
        this.insuranceID = dbResponse.insurance_type_id;
        this.signatureRequired = dbResponse.signature_required;
        this.packagedSigned = dbResponse.packaged_signed;
		this.destinationLocationID = dbResponse.destination_location_id;
    }
}

class PossessesItem {
	constructor(sqlResult) {
		this.itemID = sqlResult.item_id;
		this.courierID = sqlResult.courier_id;
		this.officeID = sqlResult.office_id;
	}
}

const ItemLogStatuses = {
	InTransit: 1,
	Processing: 2,
	Delivered: 3,
	Lost: 4,
	Received: 5
};

exports.getItemFromItemID = async function(itemID) {
    const results = await connection.query("SELECT * FROM items WHERE item_id = ?", [itemID]);

    if (results.length == 1)
        return new Item(results[0]);
    else   
        return null;
}

exports.getItemIDsFromReceivingCustomerUsername = async function(customerUsername) {
    const recipient = await connection.query("SELECT customer_id FROM customers WHERE customer_username = ?", [customerUsername]);
    const results = await connection.query("SELECT item_id FROM receives_item WHERE customer_id = ? ORDER BY item_id DESC", [recipient[0].customer_id]);
    
	const formattedResults = [];
	for (let i = 0; i < results.length; i++) {
		formattedResults.push(new Item(results[i]))
	}
	return results;
}

exports.getItemIDsFromReceivingCustomerID = async function(customerID) {
	const results = await connection.query("SELECT ri.item_id AS itemID, customer_id AS customerID, formatted_name FROM receives_item AS ri, items, locations WHERE ri.customer_id=? and locations.location_id = items.destination_location_id and ri.item_id = items.item_id ORDER BY ri.item_id DESC;", [customerID]);

	return results;
}

exports.getItemIDsFromSendingCustomerID = async function(customerID) {
	const results = await connection.query("SELECT si.item_id AS itemID, customer_id AS customerID, formatted_name FROM sends_item AS si, items, locations WHERE si.customer_id=? and locations.location_id = items.destination_location_id and si.item_id = items.item_id ORDER BY si.item_id DESC;", [customerID]);

	return results;
}

exports.getFormattedLogsFromItemID = async function(itemID) {
	const logResults = await connection.query("SELECT IL.log_timestamp AS logTimestamp, L.formatted_name AS location, ILS.il_status_name AS itemStatus FROM item_logs AS IL, locations AS L, item_log_statuses AS ILS WHERE IL.item_id=? AND IL.il_status_id=ILS.il_status_id AND IL.location_id=L.location_id ORDER BY IL.item_log_id DESC", [itemID]);
	const senderResults = await connection.query("SELECT C.customer_username AS senderUsername, L.formatted_name AS senderLocation FROM items AS I, sends_item AS SI, customers AS C, locations AS L WHERE SI.item_id=? AND I.item_id=SI.item_id AND SI.customer_id=C.customer_id AND C.location_id=L.location_id", [itemID]);

	return {
		logs: logResults,
		sender: senderResults[0]
	};
}

exports.getFormattedLogsFromSendingCustomerID = async function(customerID) {
	/*
		basically, this query will:
		1. Get all items being sent by this customer
		2. Filter out items that have been delivered
		3. Return the item id, last location, last status, and time stamp

		don't try to edit this, it's not worth it
	*/
	const results = await connection.query("SELECT DISTINCT SI.item_id as itemID, ILS.il_status_name as itemStatus, L.formatted_name AS lastLocation, IL.log_timestamp AS logTimestamp FROM item_logs AS IL, item_log_statuses AS ILS, sends_item AS SI, locations AS L WHERE SI.customer_id=? AND IL.il_status_id<>3 AND IL.il_status_id<>4 AND IL.item_log_id=(SELECT DISTINCT item_log_id FROM item_logs WHERE item_id=SI.item_id ORDER BY item_log_id DESC LIMIT 1) AND IL.location_id=L.location_id AND IL.il_status_id=ILS.il_status_id", [customerID]);

	return results;
}

exports.getAllSendingItems = async function () {
	const results = await connection.query("SELECT item_id FROM db.possesses_item WHERE courier_id IS NULL");
	return results;
}

exports.getFormattedLogsFromReceivingCustomerID = async function(customerID) {
	// the same as the one above, except for the receiving customer
	const results = await connection.query("SELECT DISTINCT RI.item_id as itemID, ILS.il_status_name as itemStatus, L.formatted_name AS lastLocation, IL.log_timestamp AS logTimestamp FROM item_logs AS IL, item_log_statuses AS ILS, receives_item AS RI, locations AS L WHERE RI.customer_id=? AND IL.il_status_id<>3 AND IL.il_status_id<>4 AND IL.item_log_id=(SELECT DISTINCT item_log_id FROM item_logs WHERE item_id=RI.item_id ORDER BY item_log_id DESC LIMIT 1) AND IL.location_id=L.location_id AND IL.il_status_id=ILS.il_status_id", [customerID]);

	return results;
}

exports.createItem = async function(itemInfo) {
	const item_type_id = itemInfo.itemTypeID;
    const dim_width = itemInfo.width;
    const dim_height = itemInfo.height;
    const dim_length = itemInfo.length;
    const weight = itemInfo.weight;
    const cost_to_send = itemInfo.costToSend;
    const amount_paid = itemInfo.amountPaid;
    const priority_type_id = itemInfo.priorityID;
    const insurance_type_id = itemInfo.insuranceID;
    const signature_required = itemInfo.signatureRequired;
    const package_signed = itemInfo.packageSigned;
	const destination_id = (await LocationDB.createLocationID(itemInfo.destination)).locationID;
	
	const sender_id = itemInfo.senderID;
	const receiving_post_office_id = itemInfo.receivingPostOfficeID;
	
	// Inserting the item into the 'items' table
    const sql = mysql.format("INSERT INTO items(item_type_id, dim_width, dim_height, dim_length, weight, expiration_date, cost_to_send, amount_paid, priority_type_id, insurance_type_id, signature_required, package_signed, destination_location_id) VALUES (?, ?, ?, ?, ?, CURRENT_DATE(), ?, ?, ?, ?, ?, ?, ?)",
    [item_type_id, dim_width, dim_height, dim_length, weight, cost_to_send, amount_paid, priority_type_id, insurance_type_id, signature_required, package_signed, destination_id]);
    const item_id = (await connection.query(sql)).insertId;

	// Inserting the item_id and sender into the 'sends_item' table
	console.log(sender_id)
	connection.query("INSERT INTO sends_item(item_id, customer_id) VALUES (?, ?)", [item_id, sender_id]);

	// Inserting the item and the responsible post office
	connection.query("INSERT INTO possesses_item(item_id, office_id) VALUES (?, ?)", [item_id, receiving_post_office_id]);

	// If the destination location belongs to customer, we include them in the 'receives_item' table
	/*
	( REPLACED BY TRIGGER tr_update_receiving_customers )

	const recipient = await CustomerAuthDB.getCustomerFromLocationID(destination_id);
	if (recipient != null) {
		connection.query("INSERT INTO receives_item(item_id, customer_id) VALUES (?, ?)", [item_id, recipient.customerID]);
	}
	*/

    // Add 2 initial logs for the item, both with a status of processing, but one with sender location and other with post office location
    // const senderLocID = (await LocationDB.getLocationFromCustomer(sender_id)).locationID;
    // connection.query("INSERT INTO item_logs(item_id, log_timestamp, il_status_id, location_id) VALUES (?, CURRENT_TIMESTAMP(), 2, ?)", [item_id, senderLocID]);

    const officeLocID = (await LocationDB.getLocationFromOfficeID(receiving_post_office_id)).locationID;
    connection.query("INSERT INTO item_logs(item_id, log_timestamp, il_status_id, location_id) VALUES (?, CURRENT_TIMESTAMP(), 5, ?)", [item_id, officeLocID]);

	return {
		success: true,
        itemID: item_id
	};
}

exports.getEntityPossessingItemFromItemID = async function (itemID) {
	// Exists when the item is being transported
	// Null when the item does not exist/has been delivered
	console.log("itemID" + itemID);
	const results = await connection.query("SELECT * FROM possesses_item WHERE item_id=?", [itemID]);

	if (results.length > 0)
		return new PossessesItem(results[0]);
	else
		return null;
}



exports.getSendingCustomerFromItemID = async function(itemID) {
	const results = await connection.query("SELECT * FROM sends_item WHERE item_id=?", [itemID]);

	if (results.length > 0)
		return await CustomerAuthDB.getCustomerFromCustomerID(results[0].customer_id);
	else
		return null;
}

exports.getReceivingCustomerFromItemID = async function(itemID) {
	const results = await connection.query("SELECT * FROM receives_item WHERE item_id=?", [itemID]);
 
	if (results.length > 0) {
		return await CustomerAuthDB.getCustomerFromCustomerID(results[0].customer_id);
	}
	else
		return null;
}

exports.assignItemToCourier = async function(itemID, courierID) {
	const currentPossession = await exports.getEntityPossessingItemFromItemID(itemID);

	if (currentPossession == null) {
		// This item does not exist
		return {
			success: false,
			message: "This item does not exist"
		};
	}
	if (currentPossession.courierID != null) {
		// A courier currently holds this
		return {
			success: false,
			message: `Courier ${currentPossession.courierID} is holding the item; cannot assign from Courier -> Courier`
		};
	}
	// console.log("currentPossesion " + currentPossession);
	const officeLocationID = (await LocationDB.getLocationFromOfficeID(currentPossession.officeID)).locationID;
	
	// Log the movement of this item
	await connection.query("UPDATE possesses_item SET courier_id=?, office_id=NULL WHERE item_id=?", [courierID, itemID]);
		
	// Update who possesses this item
	const logID = (await connection.query("INSERT INTO item_logs(item_id, log_timestamp, il_status_id, location_id) VALUES (?, NOW(), ?, ?)", [itemID, ItemLogStatuses.InTransit, officeLocationID])).insertId;
	connection.query("INSERT INTO updates_item_log VALUES (?, ?)", [courierID, logID]);
	
	return {
		success: true
	};
}

exports.assignItemToPostOffice = async function(itemID, officeID) {
	const currentPossession = await exports.getEntityPossessingItemFromItemID(itemID);

	if (currentPossession == null) {
		// This item does not exist
		return {
			success: false,
			message: "This item does not exist"
		};
	}
	if (currentPossession.officeID != null) {
		// A post office currently holds this
		return {
			success: false,
			message: `Post Office ${currentPossession.officeID} is holding the item; cannot assign from Post Office -> Post Office`
		};
	}

	const officeLocationID = (await LocationDB.getLocationFromOfficeID(officeID)).locationID;

	// Log the movement of this item
	await connection.query("INSERT INTO item_logs(item_id, log_timestamp, il_status_id, location_id) VALUES (?, NOW(), ?, ?)", [itemID, ItemLogStatuses.Processing, officeLocationID]);

	// Update who possesses this item
	await connection.query("UPDATE possesses_item SET courier_id=NULL, office_id=? WHERE item_id=?", [officeID, itemID]);

	return {
		success: true
	};
}

exports.getFormattedItemsAtPostOfficeByEmployeeID = async function(employeeID) {
	const results = connection.query("SELECT I.item_id AS itemID, L.formatted_name AS destinationLocation FROM post_offices AS PO, departments AS D, works_for_department AS WFD, possesses_item AS PI, items AS I, locations AS L WHERE WFD.employee_id=? AND WFD.department_id=D.department_id AND D.office_id=PO.office_id AND PI.office_id=PO.office_id AND I.item_id=PI.item_id AND I.destination_location_id=L.location_id ORDER BY I.item_id ASC", [employeeID]);
	return results;
}

exports.deliverItemIDToLocationID = async function(itemID, locationID) {
	const currentPossession = await exports.getEntityPossessingItemFromItemID(itemID);
	if (currentPossession.courierID == null) {
		// Courier is null, cannot deliver
		return {
			success: false,
			message: "Cannot deliver item when not possessed by courier"
		};
	}

	const item = await exports.getItemFromItemID(itemID);
	if (item.destinationLocationID != locationID) {
		// Delivering to the wrong address
		return {
			success: false,
			message: "Cannot deliver to the incorrect address"
		}
	}

	const logID = (await connection.query("INSERT INTO item_logs(item_id, log_timestamp, il_status_id, location_id) VALUES (?, NOW(), ?, ?)", [itemID, ItemLogStatuses.Delivered, locationID])).insertId;
	connection.query("INSERT INTO updates_item_log VALUES (?, ?)", [currentPossession.courierID, logID]);
	connection.query("DELETE FROM possesses_item WHERE item_id=?", [itemID]);

	// Send a notification that the item has been delivered
	/*
	( MOVED TO TRIGGER )

	const sendingCustomerID = (await connection.query("SELECT * FROM sends_item WHERE item_id=?", [itemID]))[0].customer_id;
	connection.query("INSERT INTO customer_notifications(customer_id, content) VALUES (?, ?)",
		[sendingCustomerID, `Item #${itemID} has been delivered.`]
	);

	// If there is an account receiving this package, we send them a notification too
	const receivingCustomer = await exports.getReceivingCustomerFromItemID(itemID);
	if (receivingCustomer) {
		// There is a customer receiving this package, and they have a customer_id
		connection.query("INSERT INTO customer_notifications(customer_id, content) VALUES (?, ?)",
			[receivingCustomer.customerID, `You have received item #${itemID}.`]
		)
	}
	*/

	return {
		success: true
	}
}

// Simulation part

const SIMULATE = true;

let CachedCouriers = [];
let CachedDepartments = [];
let CachedPostOffices = [];

async function prepareSimulation() {
	// We cache all the couriers and departments
	CachedCouriers = await CourierDB.getAllCouriers();
	CachedDepartments = await OfficeDB.getAllDepartments();
	CachedPostOffices = await OfficeDB.getAllPostOffices();
}

if (SIMULATE) {
	prepareSimulation();
}

function getNextValue(array, exclude) {
	// Gets the next value in 'array' which is not equal to 'exclude'
	for (let i = 0; i < array.length; i++) {
		const val = array[i];
		if (val != exclude) {
			return val;
		}
	}

	return null;
}

function getOfficeFromOfficeID(officeID) {
	for (let i = 0; i < CachedPostOffices.length; i++) {
		const office = CachedPostOffices[i];

		if (office.officeID == officeID)
			return office;
	}

	return null;
}

function getDepartmentFromDepartmentID(departmentID) {
	for (let i = 0; i < CachedDepartments.length; i++) {
		const department = CachedDepartments[i];

		if (department.departmentID == departmentID)
			return department;
	}

	return null;
}

function getPostOfficeFromPostOfficeID(officeID) {
	for (let i = 0; i < CachedPostOffices.length; i++) {
		const office = CachedPostOffices[i];

		if (office.officeID == officeID)
			return office;
	}

	return null;
}

function getCourierAtOfficeID(officeID) {
	// loop through all couriers, see what department they work at, and see if that department is part of the office
	for (let i = 0; i < CachedCouriers.length; i++) {
		const courier = CachedCouriers[i];

		for (let j = 0; j < CachedDepartments.length; j++) {
			const department = CachedDepartments[j];
			if (courier.departmentID == department.departmentID && department.officeID == officeID) {
				return courier;
			}
		}
	}

	return null;
}

exports.simulateDeliveryFromItemID = async function(itemID) {
	if (!SIMULATE) {
		console.warn("Cannot simulate delivery when not in delivery mode. Set 'SIMULATE' to true.");
		return {
			success: false,
			message: "Please enable 'simulation' first."
		};
	}
	
	const item = await exports.getItemFromItemID(itemID);
	if (item == null) {
		return {
			success: false,
			message: "This item does not exist"
		}
	}

	const currentPackageStatus = await exports.getEntityPossessingItemFromItemID(itemID);
	if (currentPackageStatus == null) {
		return {
			success: false,
			message: "Cannot simulate an already delivered item"
		}
	}

	if (currentPackageStatus.officeID == null) {
		return {
			success: false,
			message: "Cannot simulate while the item is away from the post office"
		}
	}

	// 0: Get the first post office
	const firstOffice = getPostOfficeFromPostOfficeID(currentPackageStatus.officeID);

	// 1st: assign to first courier
	const firstCourier = getCourierAtOfficeID(firstOffice.officeID);
	// 2nd: that courier goes to the next post office
	const secondOffice = getNextValue(CachedPostOffices, firstOffice);
	// 3rd: that post office assigns it to another courier
	const secondCourier = getCourierAtOfficeID(secondOffice.officeID);
	// 4th: the final courier delivers it to the destination

	await exports.assignItemToCourier(itemID, firstCourier.courierID);
	await exports.assignItemToPostOffice(itemID, secondOffice.officeID);
	await exports.assignItemToCourier(itemID, secondCourier.courierID);
	await exports.deliverItemIDToLocationID(itemID, item.destinationLocationID);

	return {
		success: true
	};
}