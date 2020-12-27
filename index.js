const express = require('express');
const env = require('./config/environment');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();


const port = 8000;

//require express ejs layouts
const expressLayouts = require('express-ejs-layouts');

//accquire the database
const db = require('./config/mongoose');

const session = require('express-session');

const passport = require('passport');

const passportLocal = require('./config/passport-local-strategy');
const passportJWT = require('./config/passport-jwt-strategy');
const passportGoogle = require('./config/passport-google-oauth2-strategy');

const MongoStore = require('connect-mongo')(session);

const sassMiddleware = require('node-sass-middleware');

const flash = require('connect-flash');

const customMware = require('./config/middleware'); 

//set up the chat server to be used with socket.io

const chatServer = require('http').Server(app);
const chatSockets = require('./config/chat_sockets').chatSockets(chatServer);
chatServer.listen(5000);
console.log('Chat server is listening on port 5000');


app.use(sassMiddleware({
    src: path.join(__dirname, env.asset_path, '/scss'),
    dest: path.join(__dirname, env.asset_path, '/css'),
    debug: true,
    outputStyle: 'extended',
    prefix: '/css'
}));


app.use(express.urlencoded());

//setting up the cookie-parser
app.use(cookieParser());

//tell app in which folder should it look out for static files
app.use(express.static(env.asset_path));

//make the uploads path available to the browser
app.use('/uploads', express.static(__dirname + '/uploads'));

app.use(logger(env.morgan.mode, env.morgan.options));

//tell that we want to use expressLayouts as they layout before the routes get going
app.use(expressLayouts);

//extract styles and scripts from sub pages into the layouts
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);




//tell that we want to set ejs as view engine
app.set('view engine', 'ejs');
app.set('views', './views');


//mongo store is ued to store the session cookie

app.use(session({
    name: 'Codeial',
    //TODO -> change the secret before deployment in production mode
    secret: env.session_cookie_key,
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: (1000 * 60 * 100)
    },
    store: new MongoStore(
        {
            mongooseConnection: db,
            autoRemove: 'disabled'
        },
        function(err) {
            console.log(err || 'connect-mongodb setup ok');
        }
    )
}));


app.use(passport.initialize());

app.use(passport.session());

//flash stores messages in the session cookie
//so set it up after session cookie
app.use(flash());
app.use(customMware.setFlash);


//middleware

app.use(passport.setAuthenticatedUser);





//use express router
app.use('/', require('./routes'));








app.listen(port, function(err) {
    if(err) {
        console.log(`Error: ${err}`);
        return;
    }
    console.log("Server is running on port ", port);
});
