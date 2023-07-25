const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
var path = require('path');
// eslint-disable-next-line no-unused-vars
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const matchRoutes = require('./routes/matchRoutes');
const __ = require('./helpers/locales')
const { ApiError, createError } = require('./errors')

dotenv.config();

app.use(express.json());
app.use(cors());


/**
 * HTML file render config
 * @param {*} options 
 */
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'jade');
app.set('json spaces', 1);

app.get('/', function(req,res){
  res.render('dashboard.html');
});

function successResponder(options = {}) {
  const { data, message = 'Success', code = 200, paging } = options;

  this.status(code).json({
    message,
    status: 'success',
    data,
    paging,
  });
}


app.use((req, res, next) => {
  res.success = successResponder.bind(res);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/match', matchRoutes);


// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError.NotFound());
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.log(err)
  if (err instanceof ApiError) {
    res.status(err.code).json({
      message: err.message,
      status: err.status,
      errors: err.errors,
    });
    return;
  }


  const response = {
    status: 'error',
    errors: {},
  };
  response.message = err.message;
  response.error = err.stack;
  response.message = __.error_went_wrong;
  // render the error page
  res.status(500).json(response);
});

module.exports = app;