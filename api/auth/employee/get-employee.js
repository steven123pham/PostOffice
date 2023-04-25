const EmployeeAuthDB = require("../../../core/EmployeeAuthDB.js");

/*
	DOCUMENTATION:
	Returns all attributes related to the employee FOR MANAGER.

	+ REQUEST:
		The manager must be logged in
	
	+ RESPONSE:
		On success:
			{
				success: true,
				employee: Employee or null
			}
		On failure:
			{
				success: false,
				message: String
			}
*/

exports.post = async function(req, res) {
	const employeeAccessToken = req.cookies.employee_access_token;
    // const managerID = Number(employeeAccessToken.split(".")[0]);

	if (employeeAccessToken != null) {
		// Manager/Admin
		const employee = await EmployeeAuthDB.getEmployeeFromEmployeeID(req.body.employeeID);

		res.send({
			success: true,
			employee: employee
		})
	}
	else {
		res.send({
			success: false,
			message: "[Employee] Please log in. Missing 'employee_access_token' cookie."
		});
	}

	/*
	The info about the account:
	{
        firstName
		middleInit
		lastName
		employeePhoneNum
		employeeEmail
		employeeUsername
		employeePassword
		accessToken
	}
	*/
}