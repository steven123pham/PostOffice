/*
	DOCUMENTATION:
	Gets the item reports.

	+ REQUEST:
		{
			fromDate: Date,
			toDate: Date (String),
			groupBy: "Item Type" | "Post Office"
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

const ReportsDB = require("../../core/ReportsDB");

exports.post = async function(req, res) {
    res.send(await ReportsDB.getItemReports(req.body.fromDate, req.body.toDate, req.body.groupBy));
}