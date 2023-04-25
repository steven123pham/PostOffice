const LocationDB = require("../../core/LocationDB");

/*
	DOCUMENTATION:
	Returns the location ID, or creates one, from the location information

	+ REQUEST:
		{
			street: String,
			city: String,
			stateCode: String,
			postalCode: number
		}
	
	+ RESPONSE:
		{
			locationID: number
		}
*/

exports.post = async function(req, res) {
	const results = await LocationDB.createLocationID(req.body)

	res.send(results);
}