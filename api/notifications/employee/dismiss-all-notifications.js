const EmployeeNotificationsDB = require("./../../../core/EmployeeNotificationsDB");

/*
	DOCUMENTATION:
	Dismisses all active locations

	+ REQUEST:
		Nothing, except the employee_access_token cookie.
	
	+ RESPONSE:
		On success:
			{
				success: true
			}
		On failure:
			{
				success: false,
				message: String
			}
*/

exports.post = async function(req, res) {
	const employeeAccessToken = req.cookies.employee_access_token;

	if (employeeAccessToken != null) {
		// Access token exists
		const employeeID = Number(employeeAccessToken.split(".")[0]);
		res.send({
			success: true,
			notifications: await EmployeeNotificationsDB.getActiveNotificationsFromEmployeeID(employeeID)
		});
	}
	else {
		res.send({
			success: false,
			message: "[Employee] Please log in. Missing 'employee_access_token' cookie."
		});
	}
}