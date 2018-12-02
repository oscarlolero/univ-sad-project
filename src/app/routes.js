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

};

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) { //mehtodo de passport
        return next();
    } else {
        res.redirect('/university');
    }
}