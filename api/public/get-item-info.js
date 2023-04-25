const ItemDB = require("../../core/ItemDB.js");

/*
	DOCUMENTATION:
	Gets item info from an item ID.

	+ REQUEST:
		{
			itemID: number
		}

	+ RESPONSE:
		{
			itemID: number
			itemTypeID: number
			width: number
			height: number
			length: number
			expirationDate: number
			costToSend: number
			amountPaid: number
			priorityID: number
			insuranceID: number
			signatureRequired: boolean
			packagedSigned: boolean
		}
*/

exports.post = async function(req, res) {
	const result = await ItemDB.getItemFromItemID(req.body.itemID);

	res.send(result);
}