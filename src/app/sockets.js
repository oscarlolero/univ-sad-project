const sql = require("msnodesqlv8");
const database = require('../config/database');

module.exports = io => {
    io.on('connection', (socket, passport) => {//registrar eventlistener
        console.log('Client connected.');

        socket.on('deleteRow', (params, callback) => {
            let query;
            switch(params.type) {
                case 'departments': query = `DELETE FROM department WHERE department_id=${params.id}`;
                break;

                default: console.log('Invalid query at deleteRow socket.');
                break;
            }
            sql.query(database.msurl, query, (err, rows) => {
                if(err) {
                    return console.log('Database error.', err);
                }
                callback();
            });
        });

        socket.on('insertRow', (params, callback) => {
            let query;

            switch(params.type) {
                case 'departments': query = `INSERT INTO department(descr) VALUES('${params.fieldsArray[0]}')`;
                break;

                default: console.log('Invalid query at insertRow socket.');
                break;
            }
            sql.query(database.msurl, query, (err, rows) => {
                if(err) {
                    return console.log('Database error.', err);
                }
                callback();
            });
        });

        socket.on('updateRow', (params, callback) => {
            let query;

            switch(params.type) {
                case 'departments': query = `UPDATE department SET descr = '${params.fieldsArray[0]}' WHERE department_id = ${params.id}`;
                break;

                default: console.log('Invalid query at updateRow socket.');
                break;
            }
            sql.query(database.msurl, query, (err, rows) => {
                if(err) {
                    return console.log('Database error.', err);
                }
                callback();
            });
        });
    }); 
};
