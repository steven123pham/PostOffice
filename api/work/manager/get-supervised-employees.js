/*
	DOCUMENTATION:
	Gets the employees who are managed by this user. Requires employee_access_token.

	+ REQUEST:
		Requires the user to be logged in.

	+ RESPONSE:
		[
			{
				itemID: number
				itemTypeID: number
				width: number
				height: number
				length: number
				expirationDate: number
				costToSend: number
				amountPaid: number
				priorityID: number
				insuranceID: number
				signatureRequired: boolean
				packagedSigned: boolean
				destinationLocationID: number
			},
			...
		]
*/

const ManagerDB = require("../../../core/ManagerDB");

exports.post = async function(req, res) {
	const employeeAccessToken = req.cookies.employee_access_token;

	if (employeeAccessToken != null) {
		// Access token exists
		const employeeID = Number(employeeAccessToken.split(".")[0]);
		res.send({
			success: true,
			employees: await ManagerDB.getManagedEmployeesFromEmployeeID(employeeID)
		})
	}
	else {
		res.send({
			success: false,
			message: "[Manager/Employee] Please log in. Missing 'employee_access_token' cookie."
		});
	}
}