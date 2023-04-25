const util = require('util');
const mysql = require('mysql');

const connectionInfo = require("../config/db-connection-info.json")

/*
config/db-connection-info.json
(replace it with yours)
{
	"host": "localhost",
	"user": "root",
	"password": "password",
	"database": "db"
}
*/

function makeDb(config) {
	const connection = mysql.createConnection(config);
	return {
		query(sql, args) {
			return util.promisify(connection.query)
				.call(connection, sql, args);
		},
		close() {
			return util.promisify(connection.end).call(connection);
		}
	};
}

exports.connection = makeDb(connectionInfo);