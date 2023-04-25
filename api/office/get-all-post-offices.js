const OfficeDB = require("../../core/OfficeDB");

/*
	DOCUMENTATION:
	Gets all post offices, no parameters required.

	+ REQUEST:
		(Nothing)

	+ RESPONSE:
		[
			{
				officeID: number,
				officeName: string,
				locationID: number
			},
			...
		]
*/

exports.post = async function(req, res) {
	res.send(await OfficeDB.getAllPostOffices());
}