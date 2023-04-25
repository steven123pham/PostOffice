/*
	DOCUMENTATION:
	Gets the post office that the employee is located at.

	+ REQUEST:
		Nothing, except the employee_access_token cookie.

	+ RESPONSE:
		On success:
			{
				success: true,
				office: {

					officeID: number,
					officeName: string,
					locationID: number
				}
			},
		On failure:
			{
				success: false,
				message: String
			}
*/
const OfficeDB = require("../../core/OfficeDB");

exports.post = async function(req, res) {
	const employeeAccessToken = req.cookies.employee_access_token;

	if (employeeAccessToken != null) {
		// Access token exists
		const employeeID = Number(employeeAccessToken.split(".")[0]);
		const result = await OfficeDB.getPostOfficeFromEmployeeID(employeeID);

		res.send({
			success: true,
			office: result
		});
	}
	else {
		res.send({
			success: false,
			message: "[Employee] Please log in. Missing 'employee_access_token' cookie."
		});
	}
}