const CustomerAuthDB = require("../../../core/CustomerAuthDB");

/*
	DOCUMENTATION:
	Returns the location ID, or creates one, from the location information

	+ REQUEST:
		The customer must be logged in
		{
			location: {
				street: String,
				city: String,
				stateCode: String,
				postalCode: number
			},
			customerPhoneNum,
			firstName,
			middleInit,
			lastName,
			customerUsername,
			password
		}
	
	+ RESPONSE:
		On success:
			{
				success: true,
			}
		On failure:
			{
				success: false,
				message: String
			}
*/

exports.post = async function(req, res) {
	const customerAccessToken = req.cookies.customer_access_token;

	if (customerAccessToken != null) {
		// Access token exists
		const customerID = Number(customerAccessToken.split(".")[0]);
		const result = await CustomerAuthDB.updateCustomerFromCustomerID(customerID, req.body);
		
		res.send(result);
	}
	else {
		res.send({
			success: false,
			message: "[Customer] Please log in. Missing 'customer_access_token' cookie."
		});
	}
}