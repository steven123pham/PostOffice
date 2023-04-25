/*
	DOCUMENTATION:
	Gets the employees who are managed by this user. Requires employee_access_token.

	+ REQUEST:
		Requires the user to be logged in.
		{
			itemID: number
			courierID: number
		}

	+ RESPONSE:
		On success:
			{
				success: true
			}
		On failure:
			{
				success: false
				message: String
			}
*/

// const ManagerDB = require("../../../core/ManagerDB");
const ItemDB = require("../../../core/ItemDB");

exports.post = async function(req, res) {
	const employeeAccessToken = req.cookies.employee_access_token;

	if (employeeAccessToken != null) {
		// Access token exists
		const employeeID = Number(employeeAccessToken.split(".")[0]);
		res.send(await ItemDB.assignItemToCourier(req.body.itemID, req.body.courierID));
	}
	else {
		res.send({
			success: false,
			message: "[Manager/Employee] Please log in. Missing 'employee_access_token' cookie."
		});
	}
}