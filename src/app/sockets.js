const sql = require("msnodesqlv8");
const database = require('../config/database');

module.exports = io => {
    io.on('connection', (socket, passport) => {//registrar eventlistener
        console.log('Client connected.');

        //OPERATION SOCKETS (UPDATE, DELETE, INSERT)

        socket.on('deleteRow', (params, callback) => {
            let query;
            switch(params.type) {
                case 'departments': query = `DELETE FROM department WHERE department_id=${params.id}`;
                break;
                
                case 'professors': query = `DELETE FROM professor WHERE professor_id=${params.id}`;
                break;

                case 'courses': query = `DELETE FROM course WHERE course_id=${params.id}`;
                break;

                case 'periods': query = `DELETE FROM period WHERE period_id=${params.id}`;
                break;

                case 'timeblocks': query = `DELETE FROM time_block WHERE time_block_id=${params.id}`;
                break;

                case 'classrooms': query = `DELETE FROM classroom WHERE classroom_id=${params.id}`;
                break;

                case 'schedules': query = `DELETE FROM schedule WHERE schedule_id=${params.id}`;
                break;

                default: console.log('Invalid query at deleteRow socket.');
                break;
            }
            console.log(query);
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

                case 'periods' : {
                    const dates = params.fieldsArray[1].split(' to ');
                    query = `INSERT INTO period(descr, begin_date, end_date) VALUES('${params.fieldsArray[0]}', '${dates[0]}', '${dates[1]}')`;
                    break;
                }

                case 'timeblocks' : {
                    query = `INSERT INTO time_block(begin_minute, end_minute, descr, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday) VALUES(
                        ${params.fieldsArray[0][0]}, 
                        ${params.fieldsArray[0][1]}, 
                        '${params.fieldsArray[2]}', 
                        ${params.fieldsArray[1][0]}, 
                        ${params.fieldsArray[1][1]},
                        ${params.fieldsArray[1][2]}, 
                        ${params.fieldsArray[1][3]},
                        ${params.fieldsArray[1][4]},
                        ${params.fieldsArray[1][5]})`;
                    break;
                }

                case 'classrooms': query = `INSERT INTO classroom(descr, seat_count, has_projector, building) 
                    VALUES(
                        '${parseInt(params.fieldsArray[1])}', 
                        '${parseInt(params.fieldsArray[2])}', 
                        ${parseInt(params.fieldsArray[0])}, 
                        '${params.fieldsArray[3]}'
                    )`;
                break;

                case 'schedules': query = `INSERT INTO schedule(professor_id, course_id, period_id, time_block_id, classroom_id) 
                    VALUES(
                        ${params.fieldsArray[0]},
                        ${params.fieldsArray[1]},
                        ${params.fieldsArray[2]},
                        ${params.fieldsArray[3]},
                        ${params.fieldsArray[4]}
                    )`;
                break;

                default: console.log('Invalid query at insertRow socket.');
                break;
            }
            console.log(query);
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

                case 'periods' : {
                    const dates = params.fieldsArray[1].split(' to ');
                    query = `UPDATE period SET descr = '${params.fieldsArray[0]}', begin_date = '${dates[0]}', end_date = '${dates[1]}' WHERE period_id = ${params.id}`;
                    break;
                }

                case 'timeblocks' : {
                    query = `UPDATE time_block SET begin_minute = ${params.fieldsArray[0][0]}, end_minute = ${params.fieldsArray[0][1]},
                    descr = '${params.fieldsArray[2]}',
                    Monday = ${params.fieldsArray[1][0]}, 
                    Tuesday = ${params.fieldsArray[1][1]}, 
                    Wednesday = ${params.fieldsArray[1][2]},
                    Thursday = ${params.fieldsArray[1][3]},
                    Friday = ${params.fieldsArray[1][4]},
                    Saturday = ${params.fieldsArray[1][5]} WHERE time_block_id = ${params.id}`;
                    break;
                }

                case 'classrooms' : {
                    query = `UPDATE classroom SET descr = ${parseInt(params.fieldsArray[1])}, seat_count = ${parseInt(params.fieldsArray[2])}, has_projector = ${params.fieldsArray[0]}, building = '${params.fieldsArray[3]}' WHERE classroom_id = ${params.id}`;
                    break;
                }

                case 'schedules': {
                    query = `UPDATE schedule SET
                        professor_id=${params.fieldsArray[0]},
                        course_id=${params.fieldsArray[1]},
                        period_id=${params.fieldsArray[2]},
                        time_block_id=${params.fieldsArray[3]},
                        classroom_id=${params.fieldsArray[4]} 
                        WHERE schedule_id=${params.id}
                    `;
                    break;
                }
                

                default: console.log('Invalid query at updateRow socket.');
                break;
            }
            console.log(query);
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

        socket.on('getScheduleData', async (params, callback) => {
            let query;
            let data = {};

            try {
                query = `SELECT professor_id, first_name + ' ' + last_name AS professor_name FROM professor ORDER BY first_name`;
                data.professorsData = await SQLQuery(query);
    
                query = `SELECT course_id, code + ' ' + descr AS course_name FROM course ORDER BY code`;
                data.coursesData = await SQLQuery(query);
    
                query = `SELECT period_id, descr AS period_name FROM period ORDER BY descr`;
                data.periodsData = await SQLQuery(query);
    
                query = `SELECT time_block_id, descr AS time_block_name FROM time_block ORDER BY begin_minute`;
                data.timeblocksData = await SQLQuery(query);
    
                query = `SELECT classroom_id, CAST(descr AS VARCHAR) + ' (' + building + ')' AS classroom_name FROM classroom ORDER BY descr`;
                data.classroomsData = await SQLQuery(query);

                callback(data);
            }
            catch(e) {
                callback('Error at retrieving data from Database.')
                return console.log(e);
            }
        });

    }); 
};

const SQLQuery = query => {
    return new Promise((resolve, reject) => {
        sql.query(database.msurl, query, (err, rows) => {
            if(err) {
                reject(err);
            }
            resolve(rows);
        });        
    });
};
