/*
	DOCUMENTATION:
	Gets all the logs related to an item and formats them. Also gives the most recent status update on it.

	+ REQUEST:
	The customer must be logged in
	
	+ RESPONSE:
	[
		{
			logTimestamp: Date,
			location: String,
			itemStatus: String
		},
		...
	]
*/
	
const ItemDB = require("../../core/ItemDB");


exports.post = async function(req, res) {
	const customerAccessToken = req.cookies.customer_access_token;

	if (customerAccessToken != null) {
		// Access token exists
		const customerID = Number(customerAccessToken.split(".")[0]);
		const result = await ItemDB.getFormattedLogsFromReceivingCustomerID(customerID)

		for (let i = 0; i < result.length; i++) {
			var t = result[i].logTimestamp.split(/[- :]/);
			result[i].logTimestamp = Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
		}
		
		res.send({
			success: true,
			receivingItems: result
		});
	}
	else {
		res.send({
			success: false,
			message: "[Customer] Please log in. Missing 'customer_access_token' cookie."
		});
	}
}