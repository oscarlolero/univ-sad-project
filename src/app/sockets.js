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
                
                case 'professors': query = `DELETE FROM professor WHERE professor_id=${params.id}`;
                break;

                case 'courses': query = `DELETE FROM course WHERE course_id=${params.id}`;
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

                case 'professors': query = `INSERT INTO professor(last_name, first_name, department_id, username, user_pass, is_administrator) VALUES('${params.fieldsArray[3]}', '${params.fieldsArray[2]}', ${params.fieldsArray[0]}, '${params.fieldsArray[4]}', '${params.fieldsArray[5]}', ${params.fieldsArray[1]})`;
                break;

                case 'courses': query = `INSERT INTO course(code, descr) VALUES('${params.fieldsArray[0]}', '${params.fieldsArray[1]}')`;
                break;

                default: console.log('Invalid query at insertRow socket.');
                break;
            }
            // console.log(query);
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

                case 'professors': query = `UPDATE professor SET first_name = '${params.fieldsArray[2]}', last_name = '${params.fieldsArray[3]}', department_id = ${params.fieldsArray[0]}, username = '${params.fieldsArray[4]}', user_pass = '${params.fieldsArray[5]}', is_administrator = ${params.fieldsArray[1]} WHERE professor_id = ${params.id}`;
                break;

                case 'courses': query = `UPDATE course SET code = '${params.fieldsArray[0]}', descr = '${params.fieldsArray[1]}' WHERE course_id = ${params.id}`;
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


        //CUSTOM SOCKETS
        socket.on('getDepartments', (params, callback) => {
            let query = 'SELECT department_id, descr FROM department';
            sql.query(database.msurl, query, (err, rows) => {
                if(err) {
                    return console.log('Database error.', err);
                }
                callback(rows);
            });
        });

        socket.on('getProfessorName', (params, callback) => {
            let query = `SELECT last_name, first_name FROM professor WHERE professor_id = ${params.professor_id}`;
            sql.query(database.msurl, query, (err, rows) => {
                if(err) {
                    return console.log('Database error.', err);
                }
                callback(rows);
            });
        });

    }); 
};
