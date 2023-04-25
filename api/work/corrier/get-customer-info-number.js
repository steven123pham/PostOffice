const CustomerAuthDB = require("../../../core/CustomerAuthDB.js");

/*
	DOCUMENTATION:
	Returns all attributes related to the customer.

	+ REQUEST:
		phonenumber : int
	
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

	const results = await CustomerAuthDB.getCustomerFromPhoneNumber(req.body.phonenumber);

	if (results != null) {
		res.send({
			success: true,
			customer: results
		});
	}
	else {
		res.send({
			success: false,
			message: "You account does not exist"
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