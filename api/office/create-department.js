const OfficeDB = require('../../core/OfficeDB');

exports.post = async function(req, res) {
	res.send(await OfficeDB.createDepartment(req.body.departmentName, req.body.officeID));
}