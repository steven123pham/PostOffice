const ItemDB = require("../../core/ItemDB");

exports.post = async function(req, res) {
    const result = await ItemDB.getAllSendingItems();
    res.send({ results : result })
}