const CourierDB = require("../../../core/CourierDB.js");

/*
	DOCUMENTATION:
	Get list of couriers.

	+ REQUEST:
		Firstly, the employee must be logged in with a valid access token in their cookies.

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

    const result = await CourierDB.getAllCouriers(req.body);
	// console.log(result);
	res.send({
        results: result,
        success: true
    })
	
}