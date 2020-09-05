import express from 'express';
import qs from 'qs';
import axios from 'axios';
import mongodb from 'mongodb';
import config from 'config';

export default class {
	rootPath = '/test';
	router = express.Router();

	constructor() {
		this.initializeRoutes();
	}

	initializeRoutes() {
		this.router.get(`${this.rootPath}`, this.test);
	}
	
	test = (req, res) => {
		req.socket.nsps['/alerts'].io.emit('panic', {
			_id: '5ec9b3df47015b2e58a04a8e',
			tone: true
		});
		res.status(200).send();
	}
}