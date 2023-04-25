const EmployeeAuthDB = require("../../../core/EmployeeAuthDB.js");

/*
	DOCUMENTATION:
	Creates an employee account.
	Only the manager can create an account.

	+ REQUEST:
		Firstly, the manager must be logged in with a valid access token in their cookies.

		The employee information must be sent in the body:
		{
			username: String
		}
	
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
		const result = await EmployeeAuthDB.updateEmployeeProfileFromEmployeeID(employeeID, req.body);
		
		res.send(result);
	}
	else {
		res.send({
			success: false,
			message: "[Employee] Please log in. Missing 'employee_access_token' cookie."
		});
	}
}