const LocationDB = require("../../core/LocationDB");

/*
	DOCUMENTATION:
	Returns the location ID, but does NOT create one, from the location information

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
				locationID: number
			}
		On failure:
			{
				success: false
			}
*/

exports.post = async function(req, res) {
	const results = await LocationDB.getLocationFromLocationID(req.body.locationID);

	res.send(results);
}