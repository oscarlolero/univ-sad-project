const LocalStrategy = require('passport-local').Strategy;
const sql = require("msnodesqlv8");

const database = require('./database.js');
module.exports = function(passport) {
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session
    passport.serializeUser(function (user, done) {
        //console.log('Serializing user: ', user);
        done(null, user);
    });
 // used to deserialize user
    passport.deserializeUser(function (user, done) {
        //console.log('Deserializing user: ', user);
        done(null, user);
     });

    passport.use('local-login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, function(req, username, inPassword, done) {
        const query = `SELECT * FROM professor WHERE username = '${username}'`;

        sql.query(database.msurl, query, (err, rows) => {
            if(err) {
                done(null, false, req.flash('loginMessage', 'Error al conectar con la base de datos.'));
                return console.log(err);
            }
            if(rows.length == 0) {
                return done(null, false, req.flash('loginMessage', 'El usuario no existe.'));
            }
            if(rows[0].user_pass != inPassword)  {
                return done(null, false, req.flash('loginMessage', 'Contraseña incorrecta.'));
            }
            return done(null, rows[0]);
        });
    }));
};