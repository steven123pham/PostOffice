const CustomerAuthDB = require("../../../core/CustomerAuthDB.js");

/*
	DOCUMENTATION:
	Returns all attributes related to the customer.

	+ REQUEST:
		The customer must be logged in
	
	+ RESPONSE:
		On success:
			{
				success: true,
				customer: Customer or null
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
		const customer = await CustomerAuthDB.getCustomerFromCustomerID(customerID);
	
		res.send({
			success: true,
			customer: customer
		});
	}
	else {
		res.send({
			success: false,
			message: "[Customer] Please log in. Missing 'customer_access_token' cookie."
		});
	}
	/*
	The info about the account:
	{
		location_ID
		customerPhoneNum
		customerEmail
		firstName
		middleInit
		lastName
		customerUsername
		customerPassword
		accessToken
	}
	*/
}