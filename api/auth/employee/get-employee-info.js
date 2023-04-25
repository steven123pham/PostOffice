const EmployeeAuthDB = require("../../../core/EmployeeAuthDB.js");

/*
	DOCUMENTATION:
	Returns all attributes related to the employee.

	+ REQUEST:
		The employee must be logged in
	
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

	if (employeeAccessToken != null) {
		// Access token exists
		const employeeID = Number(employeeAccessToken.split(".")[0]);
		const employee = await EmployeeAuthDB.getEmployeeFromEmployeeID(employeeID);

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