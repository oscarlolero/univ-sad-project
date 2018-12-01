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

                default: alert('Invalid query at deleteRow socket.');
                break;
            }
            sql.query(database.msurl, query, (err, rows) => {
                if(err) {
                    return alert('Database error.');
                }
                callback();
            });
        });
    }); 
};
