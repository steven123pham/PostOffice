const LogDB = require("../../core/LogDB.js");

/*
	DOCUMENTATION:

	+ REQUEST:
		{
			itemID: number
			locationID: number
			ilStatusID: number
		}

	+ RESPONSE:
		[
			{
				[ RowDataPacket { 'LAST_INSERT_ID()': item_log_id } ]
			}
			...
		]
*/

exports.post = async function(req, res) {
	const result = await LogDB.createLog(req.body);

	res.send(result);
}