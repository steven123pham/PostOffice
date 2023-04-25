const EmployeeAuthDB = require("../../../core/EmployeeAuthDB.js");

/*
	DOCUMENTATION:
	Updates employee deletion date DOES NOT DELETE FROM DATABASE.
	Only the manager can delete an account.

	+ REQUEST:
		Firstly, the manager must be logged in with a valid access token in their cookies.

		The employee id and supervisor id must be sent in the body:
		{
			employeeID: Number
            supervisorID: Number
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

	if (req.body.supervisorID != null) {
		res.send(await EmployeeAuthDB.removeEmployee(
			req.body
		));
	}
	else {
		res.send({
			success: false,
			message: "Invalid access token, please log in again"
		})
	}
	
}