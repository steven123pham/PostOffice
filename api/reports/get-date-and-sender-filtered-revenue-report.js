/*
	DOCUMENTATION:
	Returns data from 3 tables: item, sends_item, receives_item with date and sender filters

	+ REQUEST:
		Requires the manager to be logged in.
		{
			employeeID
			"fromDate": date
			"toDate": date
			"itemType": number
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

const ReportsDB = require("../../core/ReportsDB.js");

exports.post = async function(req, res) {

	const employeeAccessToken = req.cookies.employee_access_token;

	if (employeeAccessToken != null) {
		// Access token exists
		// const employeeID = Number(employeeAccessToken.split(".")[0]);
		res.send(await ReportsDB.getFilteredRevenueByDateAndSender(req.body));
	}
	else {
		res.send({
			success: false,
			message: "[Manager/Employee] Please log in. Missing 'employee_access_token' cookie."
		});
	}
}