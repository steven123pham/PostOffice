const ItemDB = require("../../../core/ItemDB.js");

/*
	DOCUMENTATION:
	Returns all of the item IDs that a customer owns, from a customer ID

	+ REQUEST:
		The customer ID
		{
			customerID: number
		}
	
	+ RESPONSE:
		An array of Items
		[
			Item {
				itemID: number
				itemTypeID: number
				width: number
				height: number
				length: number
				expirationDate: Date
				costToSend: number
				amountPaid: number
				priorityID: number
				insuranceID: number
				signatureRequired: bool
				packagedSigned: bool
			},
			...
		]

*/

exports.post = async function(req, res) {
	const customerAccessToken = req.cookies.customer_access_token;
	
	if (customerAccessToken != null) {
		// Access token exists
		const customerID = Number(customerAccessToken.split(".")[0]);
		const result = await ItemDB.getItemIDsFromReceivingCustomerID(customerID);
	
		res.send({
			success: true,
			items: result
		});
	}
	else {
		res.send({
			success: false,
			message: "[Customer] Please log in. Missing 'customer_access_token' cookie."
		});
	}
}