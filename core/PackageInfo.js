const DBConnection = require("./DBConnection");
const connection = DBConnection.connection;
const mysql = require("mysql");
const crypto = require("crypto");

class item {
    constructor(dbResponse) {
        this.itemID = dbResponse.item_id
        this.itemTypeID = dbResponse.item_type_id
        this.width = dbResponse.dim_width
        this.height = dbResponse.dim_height
        this.length = dbResponse.dim_length
        this.expirationDate = dbResponse.expiration_date
        this.costToSend = dbResponse.cost_to_send
        this.amountPaid = dbResponse.amount_paid
        this.priorityID = dbResponse.priority_type_id
        this.insuranceID = dbResponse.insurance_type_id
        this.signatureRequired = dbResponse.signature_required
        this.packagedSigned = dbResponse.packaged_signed
    }
}

exports.getItemFromItemID = async function(itemID) {
    const results = await connection.query("SELECT * FROM items WHERE item_id = ?" [itemID]);

    if (results.length == 1)
        return new item(results[0]);
    else   
        return null;
}

exports.createItem = async function(user, itemInfo) {
    if (await exports.getItemFromItemID(itemInfo.userID) != NULL) {
        return {
            success: false,
            message: "Item number exists"
        }
    }

    const item_type_id = itemInfo.itemTypeID;
    const dim_width = itemInfo.width;
    const dim_height = itemInfo.height;
    const dim_length = itemInfo.length;
    const cost_to_send = itemInfo.costToSend;
    const amount_paid = itemInfo.amountPaid;
    const priority_type_id = itemInfo.priorityID;
    const insurance_type_id = itemInfo.insuranceID;
    const signature_required = itemInfo.signatureRequired;
    const packaged_signed = itemInfo.packagedSigned;

    const created_by = user.userID;
    const modified_at = user.userID;

    const sql = mysql.format("INSERT INTO items(item_type_id, dim_width, dim_height, dim_length, cost_to_send, amount_paid, priority_type_id, insurance_type_id, signature_required, packaged_signed)")
}