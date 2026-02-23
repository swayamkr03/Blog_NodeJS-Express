require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;

const connectDB = require('./server/config/db');
const { isActiveRoute } = require('./server/helpers/routeHelpers');

const app = express();
const PORT = process.env.PORT || 5000;

/* -------------------- CONNECT DATABASE -------------------- */
connectDB();

/* -------------------- MIDDLEWARE -------------------- */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

/* -------------------- SESSION CONFIG -------------------- */
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

/* -------------------- STATIC FILES -------------------- */
app.use(express.static('public'));

/* -------------------- TEMPLATE ENGINE -------------------- */
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

/* -------------------- GLOBAL VIEW VARIABLES -------------------- */

// Make helper available in all views
app.locals.isActiveRoute = isActiveRoute;

// Automatically provide current route to all views
app.use((req, res, next) => {
  res.locals.currentRoute = req.path;
  next();
});

/* -------------------- ROUTES -------------------- */
app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));

/* -------------------- SERVER -------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});