const ManagerDB = require("../../../core/ManagerDB");
const OfficeDB = require("../../../core/OfficeDB")

exports.post = async function(req, res) {
	const employeeAccessToken = req.cookies.employee_access_token;

	if (employeeAccessToken != null) {
		// Access token exists
		const employeeID = Number(employeeAccessToken.split(".")[0]);
		res.send({
			success: true,
			employees: await ManagerDB.getFormattedEmployeeCouriersAtPostOffice((await OfficeDB.getPostOfficeFromEmployeeID(employeeID)).officeID)
		})
	}
	else {
		res.send({
			success: false,
			message: "[Manager/Employee] Please log in. Missing 'employee_access_token' cookie."
		});
	}
}