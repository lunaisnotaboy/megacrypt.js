var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Sentry = require('@sentry/node');
var Tracing = require("@sentry/tracing");

var indexRouter = require('./routes/index');
var debugRouter = require('./routes/debug');
var downloadRouter = require('./routes/download');
var apiRouter = require('./routes/api');

var app = express();

// sentry setup
Sentry.init({
  dsn: process.env.SENTRY_URL || "https://63fd379c86db4b79a06cd2c4e24b3488@o258853.ingest.sentry.io/5437392",
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],
  tracesSampleRate: 1.0,
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', apiRouter);
app.use('/dl', downloadRouter);
app.use('/debug', debugRouter);

// catch 404 and forward to error handler
app.use(function rootHandler(req, res, next) {
  next(createError(404));
});

app.use(
  Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture all 404 and 500 errors
      if (error.status === 404 || error.status === 500) {
        return true;
      }
      return false;
    },
  })
);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
  res.end(res.sentry + "\n");
});

module.exports = app;
