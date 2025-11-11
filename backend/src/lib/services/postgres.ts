import {Pool} from 'pg';

require('dotenv').config();

const user = process.env.POSTGRES_USER;
const host = "postgres";
const port = 5432;
const database = process.env.POSTGRES_DB;
const password = process.env.POSTGRES_PASSWORD;

const url = "postgres://" + user + ":" + password + "@" + host + ":" + port + "/" + database;

export const connectionPool = new Pool({
	connectionString: url,
	user: user,
	host: host,
	database: database,
	password: password,
	port: port,
});