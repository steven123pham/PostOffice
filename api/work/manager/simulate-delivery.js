/*
	DOCUMENTATION:
	Gets the employees who are managed by this user. Requires employee_access_token.

	+ REQUEST:
		{
			itemID: number
		}

	+ RESPONSE:
		{
			success: true
		}
*/

// Test endpoint with no verification
const ItemDB = require("../../../core/ItemDB");

exports.post = async function(req, res) {
	res.send(await ItemDB.simulateDeliveryFromItemID(req.body.itemID));
}