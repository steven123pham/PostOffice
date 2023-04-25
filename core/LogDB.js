const DBConnection =  require("./DBConnection");
const connection = DBConnection.connection;
const mysql = require("mysql");
const crypto = require("crypto");

class Log {
	constructor(dbResponse) {
		this.logID = dbResponse.item_log_id;
		this.trackingNumber = dbResponse.item_id;
		this.logTimeStamp = dbResponse.log_timestamp;
		this.statusID = dbResponse.il_status_id;
		this.locationID = dbResponse.location_id;
	}
}


exports.getLogsFromItemID = async function(itemID) {
    const results = await connection.query("SELECT * FROM item_logs WHERE item_id=?", [itemID]);

    let logs = [];

    for (let i = 0; i < results.length; i++) {
        logs.push(results[i]);
    }
    
    if (results.length >= 1)
        return logs;
    else
        return null;
}

exports.getStatusFromStatusID = async function(statusID) {
    const results = await connection.query("SELECT il_status_name FROM item_log_statuses WHERE il_status_id=?", [statusID]);

    if (results.length == 1)
        return results
    else
        return null;
}

exports.getRecentLogFromItemID = async function (itemID) {
	const results = await connection.query("SELECT * FROM item_logs WHERE item_id=? ORDER BY log_timestamp DESC", [itemID])

	if (results.length > 0)
		return results[0];
	else
		return null;
}

exports.createLog = async function(logInfo) {
    const item_id = logInfo.itemID;
    const il_status_id = logInfo.statusID;
    const location_id = logInfo.locationID;

    // Inserting the log into the 'item_logs' table
    const sql = mysql.format("INSERT INTO item_logs(item_id, log_timestamp, il_status_id, location_id) VALUES (?, CURRENT_TIMESTAMP(), ?, ?)",
    [item_id, il_status_id, location_id]);
    connection.query(sql);

    const item_log_id = await connection.query("SELECT LAST_INSERT_ID() as id")

    return {
        success: true,
        itemLogID: item_log_id[0].id
    };
}