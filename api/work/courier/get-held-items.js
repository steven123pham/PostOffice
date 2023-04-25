/*
	DOCUMENTATION:
	Gets the held packages for a courier, formatted in a easy to use way. Requires employee_access_token.

	+ REQUEST:
		Requires the user to be logged in.

	+ RESPONSE:
		[
			{
				itemID: number
				destinationLocation: String
			},
			...
		]
*/

const CourierDB = require("../../../core/CourierDB");

exports.post = async function(req, res) {
	const employeeAccessToken = req.cookies.employee_access_token;

	if (employeeAccessToken != null) {
		// Access token exists
		const employeeID = Number(employeeAccessToken.split(".")[0]);
		res.send(await CourierDB.getFormattedItemsHeldByEmployeeID(employeeID));
	}
	else {
		res.send({
			success: false,
			message: "[Employee] Please log in. Missing 'employee_access_token' cookie."
		});
	}
}