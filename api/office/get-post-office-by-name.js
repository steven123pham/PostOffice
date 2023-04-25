/*
	DOCUMENTATION:
	Gets a post office from a post office name

	+ REQUEST:
		{
			officeName: string
		}

	+ RESPONSE:
		On success:
			{
				success: true,
				office: {
					officeID: number,
					officeName: string,
					locationID: number
				}
			}
		On failure:
			{
				success: false
			}
		
*/

const OfficeDB = require("../../core/OfficeDB");

exports.post = async function(req, res) {
	const result = OfficeDB.getPostOfficeByName(req.officeName);

	res.send(result);
}