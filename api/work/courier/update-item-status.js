/*
	DOCUMENTATION:
	Updates the item status for the courier. Requires employee_access_token.

	+ REQUEST:
		Requires the user to be logged in.
		{
			location: {
				street: String
				city: String
				stateCode: String
				postalCode: number
			}
			itemID: number
		}

	+ RESPONSE:
		
*/

const CourierDB = require("../../../core/CourierDB");
const ItemDB = require("../../../core/ItemDB");
const LocationDB = require("../../../core/LocationDB");
const OfficeDB = require("../../../core/OfficeDB");

exports.post = async function(req, res) {
	const employeeAccessToken = req.cookies.employee_access_token;

	if (employeeAccessToken != null) {
		// Access token exists
		const employeeID = Number(employeeAccessToken.split(".")[0]);
		const locationID = await LocationDB.getLocationIDFromInfo(req.body.location);

		if (locationID == null) {
			// This location is not a post office or detination, since it's not in the database
			// We cannot deliver the package here
			res.send({
				success: false,
				message: "Invalid destination; please deliver to a post office or the destination."
			})
			return;
		}

		// This location is in the database, and MIGHT be valid
		// We still need to do additional checks
		const item = await ItemDB.getItemFromItemID(req.body.itemID);

		if (item == null) {
			// This item does not exist
			res.send({
				success: false,
				message: "This item does not exist"
			});
			return;
		}
		
		// Check the possession, and if its status can be updated
		const currentPossession = await ItemDB.getEntityPossessingItemFromItemID(item.itemID);
		
		if (currentPossession == null) {
			// This item has already been delivered
			res.send({
				success: false,
				message: "This item has already been delivered"
			});
			return;
		}

		if (currentPossession.courierID == null) {
			// This item is held by the post office, not the courier
			res.send({
				success: false,
				message: "This item is at the post office"
			});
			return;
		}
		
		const courierID = await CourierDB.getCourierIDFromEmployeeID(employeeID);
		if (currentPossession.courierID != courierID) {
			// This item is not managed by the courier
			res.send({
				success: false,
				message: "You do not have permission to manage this item"
			});
		}

		// This employee can manage this item
		// We now check the location and see if we can deliver it
		// We check if it's the post office or destination

		if (item.destinationLocationID == locationID) {
			// This item has been delivered to the destination
			res.send(await ItemDB.deliverItemIDToLocationID(item.itemID, locationID));
			return;
		}

		// Check if this location is a post office
		const office = await OfficeDB.getPostOfficeAtLocationID(locationID);
		if (office != null) {
			// The item has been delivered to another post office
			res.send(await ItemDB.assignItemToPostOffice(item.itemID, office.officeID));
			return
		}

		// This is an invalid location to deliver to
		res.send({
			success: false,
			message: "The item cannot be delivered here"
		});
		return;
	}
	else {
		res.send({
			success: false,
			message: "[Employee] Please log in. Missing 'employee_access_token' cookie."
		});
	}
}