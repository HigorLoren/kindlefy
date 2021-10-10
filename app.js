const express = require('express');
const config = require('config');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const eta = require('eta');
const kindlefy = require('./kindlefy');
const handleError = require('./utils/handleError');

require('dotenv').config();

const app = express();

app.engine('eta', eta.renderFile);

app.set('port', process.env.PORT || 8020);

app.set('view engine', 'eta');

app.set('views', './views');

app.use(helmet());

app.use(
  rateLimit({
    windowMs: config.get('rateLimit.windowMs'),
    max: config.get('rateLimit.max'),
    headers: true,
    message: {
      status: 'error',
      message: 'Too many requests',
      detail: {
        error:
          'The request limit has been reached. Check the Retry-After header for the waiting time (in seconds) required for the retry.',
      },
    },
  })
);

// Middleware de logging
if (app.get('env') === 'development') app.use(morgan('dev'));

app.get('/kindlefy', (req, res) => {
  res.setHeader('Last-Modified', (new Date()).toUTCString());
  kindlefy.convert(req.query.url)
    .then((data) => {
      res.render('template', data);
    })
    .catch((error) => handleError(res, error));
});

app.use(express.static(__dirname + '/public'));


app.use((req, res, next) => {
  const error = new Error('Path not found in the server');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  console.error(error);

  res.status(error.status || 500).json({
    status: 'error',
    message: error.message || 'Something went wrong with the API.',
    detail: {},
  });
});

module.exports = app;
