/*
	DOCUMENTATION:
	Assigns an employee to a department, while removing them from the previous one.

	+ REQUEST:
		Requires the user to be logged in.
		{
			employeeID: number,
			departmentID: number
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
		res.send(await ManagerDB.assignEmployeeToDepartment(req.body.employeeID, req.body.departmentID));
	}
	else {
		res.send({
			success: false,
			message: "[Manager/Employee] Please log in. Missing 'employee_access_token' cookie."
		});
	}
}