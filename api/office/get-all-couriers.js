const CourierDB = require("../../core/CourierDB");

exports.post = async function(req, res) {
	res.send(await CourierDB.getAllCouriersFormatted());
}