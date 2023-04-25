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
	const managerAccessToken = req.cookies.employee_access_token;

    console.log(req.body);

	if (managerAccessToken != null) {
		// Access token exists
		result = await EmployeeAuthDB.updateEmployeeInfoFromEmployeeID(req.body);
		
        if (result.success) {
            res.send({
                success: true
            });
        }
		else {
            res.send({
                success:false
            });
        }
	}
	else {
		res.send({
			success: false,
			message: "[Employee] Please log in. Missing 'employee_access_token' cookie."
		});
	}
}