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
	// const manager = await EmployeeAuthDB.getEmployeeFromCookies(req.cookies);

	if (req.body.supervisorID != null) {
		res.send(await EmployeeAuthDB.createEmployee(
			req.body
		));
	}
	else {
		res.send({
			success: false,
			message: "Invalid access token, please log in again"
		})
	}
	
	/*
	The "manager"/person making the account
	{
		userID: 1
		...
	},
	The info about the account
	{
		firstName: "Admin",
		middleInit: "A",
		lastName: "Administration",
		ssn: 0,
		email: "root@root.com",
		salary: 0,
		phoneNumber: 0,
		ethnicityID: 1,
		employeeUsername: "admin"
		employeePassword: "password",
		roleID: 1,
		supervisorID: 1,
	}
	*/
}