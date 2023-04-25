/*
	DOCUMENTATION:
	Gets a post office from a location

	+ REQUEST:
		{
			street: String,
			city: String,
			stateCode: String,
			postalCode: number
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

const LocationDB = require("../../core/LocationDB");
const OfficeDB = require("../../core/OfficeDB");

exports.post = async function(req, res) {
	const locationID = await LocationDB.getLocationIDFromInfo(req.body);

	if (locationID == null) {
		res.send({
			success: false
		});
		return;
	}

	const officeID = await OfficeDB.getPostOfficeAtLocationID(locationID);
	
	res.send(officeID);
}