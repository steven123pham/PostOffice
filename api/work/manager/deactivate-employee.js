const ManagerDB = require("../../../core/ManagerDB")

exports.post = async function(req, res) {
	res.send(await ManagerDB.deactivateEmployee(req.body.employeeID));
}