const CourierDB = require("../../core/CourierDB");

exports.post = async function(req, res) {
	res.send(await CourierDB.createCourier(req.body.courierName, req.body.courierTypeID, req.body.departmentID))
}