const LocalStrategy = require('passport-local').Strategy;
const sql = require("msnodesqlv8");

const database = require('./database');
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
    // para registrarse
    // passport.use('local-signup', new LocalStrategy({
    //     usernameField: 'username',
    //     passwordField: 'password',
    //     passReqToCallback: true
    // }, function(req, username, password, done) {
    //     User.findOne({'local.username': username}, function (err, user) {
    //         if(err) { 
    //             return done(err); 
    //         }
    //         if(user) {
    //             return done(null, false, req.flash('signupMessage', 'The email is already taken.')); //(sin error, sin usuario, mensaje)
    //         } else {
    //             var newUser = new User();
    //             newUser.local.username = username;
    //             newUser.local.password = newUser.generateHash(password);
    //             newUser.save(function (err) {
    //                 if(err) {throw err;} //aqui se puede usar promesas o asyncawait
    //                 return done(null, newUser);
    //             });
    //         }
    //     })
    // }));

    // // para login
    // passport.use('local-login', new LocalStrategy({
    //     usernameField: 'username',
    //     passwordField: 'password',
    //     passReqToCallback: true
    // }, function(req, username, password, done) {
    //     User.findOne({'local.username': username}, function (err, user) {
    //         if(err) { return done(err); }
    //         if(!user) {
    //             return done(null, false, req.flash('loginMessage', 'El usuario no existe.')); //(sin error, sin usuario, mensaje)
    //         }
    //         if(!user.validPassword(password)) {//si la pass es falsa, nop coincide
    //             return done(null, false, req.flash('loginMessage', 'Wrong pass.'));
    //         }
    //         return done(null, user);
    //     })
    // }));
    // para login MS SQL SERVER
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