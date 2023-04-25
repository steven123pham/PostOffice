const EmployeeAuthDB = require("../../../core/EmployeeAuthDB.js");

/*
	DOCUMENTATION:
	Get list of deleted employees managed by given manager.

	+ REQUEST:
		Firstly, the manager must be logged in with a valid access token in their cookies.

		The supervisor id must be sent in the body:
		{
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

    // console.log("in api: ", req);

	if (req.body.supervisorID != null) {
        result = await EmployeeAuthDB.getDeletedEmployeesUnderSupervisorID(req.body)
		res.send({
            results: result,
            success: true
        })
	}
	else {
		res.send({
			success: false,
			message: "Invalid access token, please log in again"
		})
	}
	
}