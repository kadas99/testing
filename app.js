var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    config = require('./config/config'),
    usersModel = require('./src/models/users');
    mongoose = require('mongoose'),
    app = express(),
    connect = function () {
        var options = {
            server: {
                socketOptions: {
                    keepAlive: 1
                }
            }
        };
        mongoose.connect(config.database.uri, options);
    };


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

//connecting mongoose

connect();
mongoose.connection.on('error', console.log);
mongoose.connection.on('disconnected', connect);
mongoose.connection.on('open', function () {
    console.log('Database is running OK');
});

app.get('/', function(req, res) {
    res.render('index', { title: config.siteName,
        search: 'Buscar'});
})
    .get(config.endpoints.users, function(req, res){
    res.render('users', {title: config.siteName, users: 'Users'});
})
    .get(config.endpoints.register, function (req, res){
        res.render('registerForm', {title: config.siteName, register: 'Register'});
    })

    .post(config.endpoints.register, function (req, res){


        if(req.body.password === req.body.repeatPassword){
        var user = new usersModel(),
            upsertData,
            options = {
                new: true,
                upsert: true
            };

        user.email = req.body.email;
        user.name = req.body.name;
        user.lastName = req.body.lastName;
        user.password = req.body.password;

        upsertData = user.toObject();
        delete upsertData._id;

        usersModel.findOneAndUpdate({email: user.email}, upsertData, options, function (error) {
            if (!error) {
                res.render('register', {name: user.name,
                    lastName: user.lastName,
                    email: user.email
                });
                res.render('registerSuccess', {message: config.message.userSaved})
                console.log('user was saved');
            } else {
                res.render('registerError', {errorMessage: error});
                console.log('user was NOT saved');
            }
        });

        } else {
            res.render('registerError', {errorMsg: config.message.passwordError});
        }


    })

    .get(config.endpoints.login, function (req, res){
        res.render('login', {title: config.siteName, login: 'Login'});
    })

    .get(config.endpoints.sell, function (req, res){
        res.render('sell', {title: config.siteName, sell: 'Sell'});
    })

    .get(config.endpoints.contact, function (req, res){
        res.render('contact', {title: config.siteName, contact: 'Contact'});
    });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
