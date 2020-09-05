import express from 'express';
import qs from 'qs';
import axios from 'axios';
import mongodb from 'mongodb';
import config from 'config';

export default class {
	rootPath = '/search';
	router = express.Router();

	constructor() {
		this.initializeRoutes();
	}

	initializeRoutes() {
		this.router.get(`${this.rootPath}`, this.test);
	}
	
	character = (req, res) => {
        
    }
}