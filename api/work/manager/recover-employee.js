const ManagerDB = require("../../../core/ManagerDB")

exports.post = async function(req, res) {
	res.send(await ManagerDB.recoverEmployee(req.body.employeeID));
}