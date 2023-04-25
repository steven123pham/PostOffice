const itemDB = require("../../core/ItemDB.js");
exports.post = async function(req, res) {
	const results = await itemDB.getItemFromItemID(req.body.item_id);
	res.send(results);
}