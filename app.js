const createError = require('http-errors');
const express = require('express');
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const exphbs = require('express-handlebars')
const { mongo_db } = require('./database')
require("dotenv").config();
const env = require('./config')
const app = express();
const passport = require('passport');
const bodyParser = require('body-parser')
const busboyBodyParser = require('busboy-body-parser');
// const googleStratergy = require('./lib/googleStrategy')
const { Datastore } = require('@google-cloud/datastore');
const DatastoreStore = require('@google-cloud/connect-datastore')(session);


global.db = new mongo_db(env)
const viewsRouter = require('./routes/views.js');
const apiRouter = require('./routes/api.js');
// [START session]
// Configure the session and session storage.
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
// [END session]

// OAuth2
app.use(passport.initialize());
app.use(passport.session());
app.use(require('./lib/oauth2').router);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    partialsDir: path.join(app.get('views'), 'partials'),
    layoutsDir: path.join(app.get('views'), 'layouts'),
    extname: '.hbs',
    helpers: require('./config/helpers')
}))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())


app.set('view engine', 'hbs');
app.use(logger('dev'));
app.use(cookieParser());


app.use('/', viewsRouter);
app.use('/api', apiRouter);
app.use((req, res, next) => {
    res.locals.user = req.user || null
    next();
})

app.use('/public', express.static(path.join(__dirname, './public')));
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404))
});


// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

const port = (process.env.PORT || '4000');
app.set('port', port);
app.listen(port, () => {
    console.log(`Server on http://localhost:${port}`);
    console.log(`Enviroment: ${app.get('env')}`);
})