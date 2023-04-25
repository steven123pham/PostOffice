/*
	DOCUMENTATION:
	Gets the items that a packager needs to manage.

	+ REQUEST:
		Requires the user to be logged in.

	+ RESPONSE:
		On success:
			{
				success: true,
				items = [
					{
						itemID: number,
						formattedLocation: String
					}
				]
			}
		On failure:
			{
				success: false
				message: String
			}
*/

const ItemDB = require("../../../core/ItemDB");

exports.post = async function(req, res) {
	const employeeAccessToken = req.cookies.employee_access_token;
	if (employeeAccessToken != null) {
		// Access token exists
		const employeeID = Number(employeeAccessToken.split(".")[0]);
		res.send({
			success: true,
			items: await ItemDB.getFormattedItemsAtPostOfficeByEmployeeID(employeeID)
		});
	}
	else {
		res.send({
			success: false,
			message: "[Manager/Employee] Please log in. Missing 'employee_access_token' cookie."
		});
	}
}