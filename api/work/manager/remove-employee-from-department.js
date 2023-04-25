/*
	DOCUMENTATION:
	Removes an employee from a department.

	+ REQUEST:
		Requires the user to be logged in.
		{
			employeeID: number
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

const ManagerDB = require("../../../core/ManagerDB");

exports.post = async function(req, res) {
	const employeeAccessToken = req.cookies.employee_access_token;

	if (employeeAccessToken != null) {
		// Access token exists
		// const employeeID = Number(employeeAccessToken.split(".")[0]);
		res.send(await ManagerDB.removeEmployeeFromDepartment(req.body.employeeID));
	}
	else {
		res.send({
			success: false,
			message: "[Manager/Employee] Please log in. Missing 'employee_access_token' cookie."
		});
	}
}