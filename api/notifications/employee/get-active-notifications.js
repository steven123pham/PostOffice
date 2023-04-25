const EmployeeNotificationsDB = require("../../../core/EmployeeNotificationsDB");

/*
	DOCUMENTATION:
	Gets ACTIVE notifications. These are notifications which have not been dismissed.

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
		const result = await EmployeeNotificationsDB.getActiveNotificationsFromEmployeeID(employeeID);

		for (let i = 0; i < result.length; i++) {
			var t = result[i].dateReceived.split(/[- :]/);
			result[i].dateReceived = Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
		}
		
		res.send({
			success: true,
			notifications: result
		});
	}
	else {
		res.send({
			success: false,
			message: "[Employee] Please log in. Missing 'employee_access_token' cookie."
		});
	}
}