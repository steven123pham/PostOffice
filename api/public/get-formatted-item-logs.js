/*
DOCUMENTATION:
Gets all the logs related to an item and formats them.

	+ REQUEST:
	{
		itemID: number
	}
	
	+ RESPONSE:
	{
		logs: [
			{
				logTimestamp: Date,
				location: String,
				itemStatus: String
			},
			...
		],
		sender: {
			senderUsername: String,
			senderLocation: String
		}
	}
*/
	
const ItemDB = require("../../core/ItemDB.js");


exports.post = async function(req, res) {
	const result = await ItemDB.getFormattedLogsFromItemID(req.body.itemID);

	for (let i = 0; i < result.logs.length; i++) {
		var t = result.logs[i].logTimestamp.split(/[- :]/);
		result.logs[i].logTimestamp = Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
	}

	res.send(result);
}