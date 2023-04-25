const CustomerAuthDB = require("../../../core/CustomerAuthDB.js");

/*
	DOCUMENTATION:
	Returns the customer's access token if the username and password are valid.

	+ REQUEST:
		{
			username: String,
			password: String
		}
	
	+ RESPONSE:
		On success:
			{
				success: true
				accessToken: String
			}
		On failure:
			{
				success: false,
			}
*/

exports.post = async function(req, res) {
	const result = await CustomerAuthDB.logInAsCustomer(req.body.username, req.body.password);
	
	res.send(result);
}