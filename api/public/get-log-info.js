const LogDB = require("../../core/LogDB.js");

/*
	DOCUMENTATION:
	Gets ACTIVE notifications. These are notifications which have not been dismissed.

	+ REQUEST:
		{
			itemID: number
		}

	+ RESPONSE:
		[
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
			...
		]
*/

exports.post = async function(req, res) {
	const result = await LogDB.getLogsFromItemID(req.body.itemID);
	res.send({items: result});
}