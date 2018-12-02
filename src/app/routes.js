const sql = require("msnodesqlv8");
const database = require('../config/database');

module.exports = (app, passport) => {
    app.get('/', (req,res) => {
        res.redirect('/university');
    });
    
    app.get('/login', (req,res) => {
        if(req.isAuthenticated()) { //mehtodo de passport
            res.redirect('/university');
        } else {
            res.render('login', {
                message: req.flash('loginMessage')
            });
        }
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/university',
        failureRedirect: '/login',
        failureFlash: true //que se muestren los mensajes
    }));

	app.get('/logout', (req, res) => {
        if(req.isAuthenticated()) { //mehtodo de passport
            req.logout();
            console.log('User logged out.');
        }
        res.redirect('/university');
	}); 
    
    //UNIVERSITY PRINCIPAL
	app.get('/university', (req, res) => {
        // Mostrar schedules para profesores
        if(req.isAuthenticated()) {
            const query = `SELECT professor_name, course_code, course_name, period, time_block, classroom, classroom_building FROM vw_Schedule WHERE professor_id = ${req.session.passport.user.professor_id}`;
            sql.query(database.msurl, query, (err, rows) => {
                if(err) {
                    return alert('Database error.');
                }
                res.render('university', {
                    isAdmin: req.session.passport.user.is_administrator == true ? 2 : 1,
                    username: `${req.session.passport.user.first_name} ${req.session.passport.user.last_name}`,
                    rows: rows
                });
            });
        } else {
            //Mostrar Schedules para usuarios no logeados
            const query = 'SELECT professor_name, course_code, course_name, period, time_block, classroom, classroom_building FROM vw_Schedule';
            sql.query(database.msurl, query, (err, rows) => {
                if(err) {
                    return console.log('Database error.', err);
                }
                res.render('university', {
                    isAdmin: 0,
                    rows: rows
                });
            });
        }
    });

    //EDIT DEPARTMENTS
    app.get('/departments', isLoggedIn, (req, res) => {
        const query = `SELECT department_id, descr FROM department`;
        sql.query(database.msurl, query, (err, rows) => {
            if(err) {
                return console.log('Database error.', err);
            }
            res.render('departments', {
                isAdmin: req.session.passport.user.is_administrator == true ? 2 : 1,
                username: `${req.session.passport.user.first_name} ${req.session.passport.user.last_name}`,
                rows: rows
            });
        });
    });  

    //EDIT PROFESSORS
    app.get('/professors', isLoggedIn, (req, res) => {
        let query = `SELECT professor_id, first_name + ' ' + last_name AS name, department_descr, username, user_pass, is_administrator FROM vw_Professor`;
        let data = {};
        
        //GET PROFESSORS
        sql.query(database.msurl, query, (err, professors) => {
            if(err) {
                return console.log('Database error.', err);
            }
            data.professors = professors;

            //GET DEPARTMENTS FOR DROPDOWNLIST
            query = `SELECT department_id, descr FROM department`;
            sql.query(database.msurl, query, (err, departments) => {
                if(err) {
                    return console.log('Database error.', err);
                }
                data.departments = departments;
                // console.log(JSON.stringify(data, null, 4));
                res.render('professors', {
                    isAdmin: req.session.passport.user.is_administrator == true ? 2 : 1,
                    username: `${req.session.passport.user.first_name} ${req.session.passport.user.last_name}`,
                    data: data
                });
            });
        });
    });

    //EDIT COURSES
    app.get('/courses', isLoggedIn, (req, res) => {
        const query = `SELECT * FROM course`;
        sql.query(database.msurl, query, (err, rows) => {
            if(err) {
                return console.log('Database error.', err);
            }
            res.render('courses', {
                isAdmin: req.session.passport.user.is_administrator == true ? 2 : 1,
                username: `${req.session.passport.user.first_name} ${req.session.passport.user.last_name}`,
                rows: rows
            });
        });
    });

    //EDIT PERIODS
    app.get('/periods', isLoggedIn, (req, res) => {
        const query = `SELECT period_id, descr, FORMAT(begin_date, N'MM/dd/yyyy HH:mm:ss') AS begin_date, FORMAT(end_date, N'MM/dd/yyyy HH:mm:ss') AS end_date FROM period`;
        sql.query(database.msurl, query, (err, rows) => {
            if(err) {
                return console.log('Database error.', err);
            }
            res.render('periods', {
                isAdmin: req.session.passport.user.is_administrator == true ? 2 : 1,
                username: `${req.session.passport.user.first_name} ${req.session.passport.user.last_name}`,
                rows: rows
            });
        });
    });

    //EDIT TIME BLOCKS
    app.get('/timeblocks', isLoggedIn, (req, res) => {
        const query = `SELECT * FROM time_block`;
        sql.query(database.msurl, query, (err, rows) => {
            if(err) {
                return console.log('Database error.', err);
            }

            let timeBlocks = rows.map(row => {
                return {
                    timeBlock: `${getTimeBlock(row.begin_minute, row.end_minute)}`,
                    daysAWeek: `${getDaysAWeek(row.Monday, row.Tuesday, row.Wednesday, row.Thursday, row.Friday, row.Saturday)}`,
                    time_block_id: row.time_block_id
                }
            });

            res.render('timeblocks', {
                isAdmin: req.session.passport.user.is_administrator == true ? 2 : 1,
                username: `${req.session.passport.user.first_name} ${req.session.passport.user.last_name}`,
                timeblocks: timeBlocks
            });
        });
    });

    //EDIT CLASSROOMS
    app.get('/classrooms', isLoggedIn, (req, res) => {
        const query = `SELECT * FROM classroom`;
        sql.query(database.msurl, query, (err, rows) => {
            if(err) {
                return console.log('Database error.', err);
            }
            res.render('classrooms', {
                isAdmin: req.session.passport.user.is_administrator == true ? 2 : 1,
                username: `${req.session.passport.user.first_name} ${req.session.passport.user.last_name}`,
                rows: rows
            });
        });
    });

};

const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) { //metodo de passport
        return next();
    } else {
        res.redirect('/university');
    }
};

const getTimeBlock = (beginmin, endmin) => {

    let beginTime = [Math.floor(beginmin / 60), beginmin % 60].map(el => {
        if(el < 10) {
            let temp = '0';
            temp = temp.concat(el);
            return temp;
        } else {
            return el;
        }
    }).join(':');

    let endTime = [Math.floor(endmin / 60), endmin % 60].map(el => {
        if(el < 10) {
            let temp = '0';
            temp = temp.concat(el);
            return temp;
        } else {
            return el;
        }
    }).join(':');
    
    return `${beginTime} - ${endTime}`;
};

const getDaysAWeek = (mon, tue, wed, thu, fri, sat) => {
    return [
        mon ? 'Mon' : '',
        tue ? 'Tue' : '',
        wed ? 'Wed' : '',
        thu ? 'Thu' : '',
        fri ? 'Fri' : '',
        sat ? 'Sat' : '',
    ].filter(el => el != '').join(', ');
};


