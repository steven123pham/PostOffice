const CustomerNotificationsDB = require("./../../../core/CustomerNotificationsDB");

/*
	DOCUMENTATION:
	Dismisses all active locations

	+ REQUEST:
		Nothing, except the customer_access_token cookie.
	
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
	const customerAccessToken = req.cookies.customer_access_token;

	if (customerAccessToken != null) {
		// Access token exists
		const customerID = Number(customerAccessToken.split(".")[0]);
		CustomerNotificationsDB.dismissAllNotificationsFromCustomerID(customerID);
		
		res.send({
			success: true,
		});
	}
	else {
		res.send({
			success: false,
			message: "[Customer] Please log in. Missing 'customer_access_token' cookie."
		});
	}
}