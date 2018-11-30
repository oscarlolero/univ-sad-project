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
    
    //calificaciones
	app.get('/university', (req, res) => {
        // Mostrar schedules para profesores
        if(req.isAuthenticated()) {
            const query = `SELECT professor_name, course_code, period, time_block, classroom, classroom_building FROM vw_Schedule WHERE professor_id = ${req.session.passport.user.professor_id}`;
            sql.query(database.msurl, query, (err, rows) => {
                if(err) {
                    return alert('Database error.');
                }
                res.render('university', {
                    isAdmin: req.session.passport.user.is_administrator == true ? 2 : 1,
                    username: req.session.passport.user.username,
                    rows: rows
                });
            });
        } else {
            //Mostrar Schedules para usuarios no logeados
            const query = 'SELECT professor_name, course_code, course_name, period, time_block, classroom, classroom_building FROM vw_Schedule';
            sql.query(database.msurl, query, (err, rows) => {
                if(err) {
                    return alert('Database error.');
                }
                res.render('university', {
                    isAdmin: 0,
                    rows: rows
                });
            });
        }
    });
};

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) { //mehtodo de passport
        return next();
    }
}