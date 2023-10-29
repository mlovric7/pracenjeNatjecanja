#!/usr/bin/env node

/**
 * Module dependencies.
 */

import app from './app';
import https from 'https';
import fs from 'fs'

const debug = require('debug')('app:app');

if(process.env.RENDER_EXTERNAL_URL) {
    const hostname = '0.0.0.0';
    app.listen(app.get('port'), hostname)
} else {
    const server = https.createServer({
        key: fs.readFileSync('server.key'),
        cert: fs.readFileSync('server.cert')
    }, app);

    server.listen(app.get('port'));
    server.on('error', onError);
    server.on('listening', onListening);

    /**
     * Event listener for HTTP app "listening" event.
     */

    function onListening() {
        const addr = server.address();
        debug(addr)
        debug(process.env.RENDER_EXTERNAL_URL)
        const bind = typeof addr === 'string'
            ? 'pipe ' + addr
            // @ts-ignore
            : 'port ' + addr.port;
        debug('Listening on ' + bind);
        debug('App link: https://localhost:' + app.get('port'))
    }

}


/**
 * Event listener for HTTP app "error" event.
 */

function onError(error: { syscall: string; code: any; }) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    const port = app.get('port')
    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

