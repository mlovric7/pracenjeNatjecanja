import createError from 'http-errors';
import express, {Express, NextFunction, Request, Response} from 'express';
import path from 'path';

import cookieParser from 'cookie-parser';
import logger from 'morgan';

import indexRouter from './routes/index';
import usersRouter from './routes/users';
import competitionsRouter from './routes/competitions'
import { auth } from "express-openid-connect";
import dotenv from 'dotenv'
import {setUsername} from "./utils/oidc-username";

dotenv.config()

const app: Express = express();


// view engine setup
app.set('views', path.join(__dirname, '../src/views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../src/public')));
app.use('/css', express.static(path.join(__dirname, '..//node_modules/bootstrap/dist/css')))

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);


const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SECRET,
    baseURL: `https://localhost:${port}`,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    issuerBaseURL: 'https://dev-sbtldc17fw6qgphd.eu.auth0.com'
};

app.use(auth(config));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/competitions', competitionsRouter);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
    next(createError(404));
});

// error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error', {username: setUsername(req)});
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string): string | number | false {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

export default app;
