/*
	DOCUMENTATION:
	Creates a post office with a location and a description

	+ REQUEST:
		{
			officeName: string,
			location: {
				street: String,
				city: String,
				stateCode: String,
				postalCode: number
			}
		}

	+ RESPONSE:
		On success:
			{
				success: true,
				officeID: number
			}
		On failure:
			{
				success: false,
			}		
*/

const OfficeDB = require("../../core/OfficeDB");
const LocationDB = require("../../core/LocationDB");

exports.post = async function(req, res) {
	const locationResult = await LocationDB.createLocationID(req.body.location);
	const result = await OfficeDB.createPostOffice(req.body.officeName, locationResult.locationID);
	res.send(result);
}