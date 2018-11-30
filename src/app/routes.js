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
        // console.log('user',req.session.passport.user.nombre);
        if(req.isAuthenticated()) {
            res.render('university', {
                isAdmin: req.session.passport.user.is_administrator == true ? 2 : 1,
                username: req.session.passport.user.username
            });
        } else {
            const query = 'SELECT professor_name, course_code, period, time_block, classroom, classroom_building FROM vw_Schedule';
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