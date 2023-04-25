/*
	DOCUMENTATION:
	Returns data from 3 tables: item, sends_item, receives_item

	+ REQUEST:
		Requires the manager to be logged in.
		{
			employeeID
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

    // console.log(req.body);
    // res.send(await ReportsDB.getUnfilteredRevenue());


	const employeeAccessToken = req.cookies.employee_access_token;

	if (employeeAccessToken != null) {
		// Access token exists
		// const employeeID = Number(employeeAccessToken.split(".")[0]);
		res.send(await ReportsDB.getUnfilteredRevenue());
	}
	else {
		res.send({
			success: false,
			message: "[Manager/Employee] Please log in. Missing 'employee_access_token' cookie."
		});
	}
}