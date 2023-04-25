const ItemDB = require("../../core/ItemDB.js");

/*
	DOCUMENTATION:
	Gets ACTIVE notifications. These are notifications which have not been dismissed.

	+ REQUEST:
		Requires the user to be logged in and have the customer_access_token
		{
			destination: {
				street: String,
				city: String,
				stateCode: String,
				postalCode: number
			},
			receivingPostOfficeID: number
			
			itemTypeID: number
			width: number
			height: number
			length: number
			weight: number
			amountPaid: number
			costToSend: number
			insuranceID: number
			signatureRequired: boolean
			packageSigned: boolean
			priorityID: number

			senderID: int
		}
	
	+ RESPONSE:
		On success:
			{
				success: true
				itemID: number
			}
		On failure:
			{
				success: false,
				message: String
			}
*/

exports.post = async function(req, res) {
	const customerCookie = req.cookies.customer_access_token;
	
	if (!customerCookie) {
		res.send({
			success: false,
			message: "[Customer] Please log in"
		});
		return;
	}
	// Insert the senderID from the customer cookie
	const result = await ItemDB.createItem(req.body);
	
	res.send(result);
}