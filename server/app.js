import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import httpLogger from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectMongoDB from 'connect-mongodb-session';
import rfs from 'rotating-file-stream';
import helmet from 'helmet';
import mongodb from 'express-mongo-db';
import cors from 'cors';
import http from 'http';

import IO from './services/socket.service.js';

export default class {
	httpControllers = [];
	socketControrllers = [];

	trustedHttpSources = {};

	constructor(httpControllers, socketControrllers, port) {
		this.app = express();
		this.app.set('trust proxy', true);
		this.io = new IO();
		this.httpControllers = httpControllers;
		this.socketControrllers = socketControrllers;
		this.port = port;
		this.initializeMiddlewares();
		this.server = http.createServer(this.app);
	}

	initializeMiddlewares() {
		const httpErrorsLogStream = rfs.createStream('http-error.log', {
			size: '10M', // rotate every 10 MegaBytes written
			interval: '7d', // rotate evry week
			compress: 'gzip', // compress rotated files
			path: './logs',
		});

		const httpAccessLogsStream = rfs.createStream('http-access.log', {
			size: '10M',
			interval: '7d',
			compress: 'gzip',
			path: './logs',
		});

		this.app
			.use(helmet())
			.use(
				httpLogger('combined', {
					skip: (req, res) => res.statusCode < 400,
					stream: httpErrorsLogStream,
				}),
			)
			.use(
				httpLogger('combined', {
					skip: (req, res) => res.statusCode >= 400,
					stream: httpAccessLogsStream,
				}),
			)
			.use(bodyParser.urlencoded({ extended: true }))
			.use(bodyParser.json())
			.use(express.json())
			.use(
				cors({
					origin: [process.env.MDT_ADDRESS, 'http://localhost:3000'],
					credentials: true,
				}),
			)
			.use((req, res, next) => {
				if (req.path.startsWith('/auth') || req.path.startsWith('/search')) return next();
				let apiKey = Buffer.from(req.headers.authorization.replace('Basic ', ''), 'base64').toString();

				if (this.trustedHttpSources[req.ip] == null || (this.trustedHttpSources[req.ip].key !== apiKey)) {
					if (req.headers.authorization != null && req.headers.authorization !== '') {
						console.log('Validating API Request With Invision')
						axios.post(process.env.API_VALIDATE, null, {
							auth: {
								username: apiKey,
							},
							headers: {
								'Content-Type': 'application/json',
							},
						}).then(() => {
							console.log(`Trusting IP: ${req.ip} That Validated With ${apiKey}`);
							this.trustedHttpSources[req.ip] = {
								time: Date.now(),
								key: apiKey
							}
							next();
						}).catch((err) => {
							console.log(err);
							console.log(`${err.response.status}: ${err.response.statusText}`);
							res.status(401).send();
							return;
						});
					} else {
						console.log('No Authentication Header Passed')
					}
				} else {
					console.log('Request Coming From Previously Trusted Source')
					next();
				}
			})
			.use((req, res, next) => {
				req.socket = this.io;
				next();
			});

		this.httpControllers.forEach((controller) => {
			this.app.use('/', controller.router);
		});
	}

	listen() {
		this.server.listen(this.port, () => {
			console.log(`App listening on the port ${this.port}`);
		});

		this.io.start(this.server, this.socketControrllers);

		return this.server;
	}
}

export const sessionChecker = (req, res, next) => {
	if (req.session.account) {
		next();
	} else {
		res.status(401).send({ error: 'No Session' });
	}
};
