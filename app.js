const createError = require('http-errors');
const express = require('express');
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const exphbs = require('express-handlebars')
const {mongo_db} = require('./database')
const env = require('./config')
const app = express();
const bodyParser = require('body-parser')
const busboyBodyParser = require('busboy-body-parser');


global.db = new mongo_db(env)
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const apiRouter = require('./routes/api');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  partialsDir: path.join(app.get('views'), 'partials'),
  layoutsDir: path.join(app.get('views'), 'layouts'),
  extname: '.hbs'
}))
app.set('view engine', 'hbs');
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));
// parse application/json
app.use(bodyParser.json());
//parse multipart/form-data    
app.use(busboyBodyParser());


app.use(session({
  secret: 'secret',
  useNewUrlParser: true,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: db.connection })
}))

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
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
  console.log('Server on port: ', port);
  console.log("Enviroment: ", app.get('env'));
})
