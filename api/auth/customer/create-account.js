const CustomerAuthDB = require("../../../core/CustomerAuthDB.js");

/*
	DOCUMENTATION:
	Creates a customer account and returns, if successful, the customer access token.

	+ REQUEST:
		Information about the customer
		{
			locations: {
				street,
				city,
				stateCode,
				postal_code
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
				customer: Customer
			}
		On failure:
			{
				success: false,
				message: String
			}
*/

exports.post = async function(req, res) {
	res.send(await CustomerAuthDB.createCustomer(
		req.body
	));

	/*
	The info about the account:
	{
		locationID
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