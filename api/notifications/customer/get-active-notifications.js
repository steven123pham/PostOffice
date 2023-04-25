const CustomerNotificationsDB = require("../../../core/CustomerNotificationsDB");

/*
	DOCUMENTATION:
	Gets ACTIVE notifications. These are notifications which have not been dismissed.

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
		const result = await CustomerNotificationsDB.getActiveNotificationsFromCustomerID(customerID);

		for (let i = 0; i < result.length; i++) {
			var t = result[i].dateReceived.split(/[- :]/);
			result[i].dateReceived = Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
		}
		
		res.send({
			success: true,
			notifications: result
		});
	}
	else {
		res.send({
			success: false,
			message: "[Customer] Please log in. Missing 'customer_access_token' cookie."
		});
	}
}