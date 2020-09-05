import express from 'express';
import qs from 'qs';
import axios from 'axios';
import mongodb from 'mongodb';
import config from 'config';

export default class {
	rootPath = '/user';
	router = express.Router();

	constructor() {
		this.initializeRoutes();
	}

	initializeRoutes() {
		this.router.post(`${this.rootPath}/loginGame`, this.loginGame);
		this.router.post(`${this.rootPath}/logoutGame`, this.logoutGame);
		this.router.post(`${this.rootPath}/onDuty`, this.onDuty);
		this.router.post(`${this.rootPath}/offDuty`, this.offDuty);
    }
    
    loginGame = (req, res) => {
        let { user, character } = req.body;

        character = {
            ...character,
            _id: character.ID
        };

        req.socket.nsps['/user'].controller.ingameUsers[user] = character;

        for (var key in req.socket.nsps['/user'].controller.clients) {
            let client = req.socket.nsps['/user'].controller.clients[key];
            if (client.authToken.user === user) {
                req.socket.nsps['/user'].controller.setCharacter(req.socket, client, character);
                break;
            }
        }

        res.status(200).send();
    }
    
    logoutGame = (req, res) => {
        let { user } = req.body;
        delete req.socket.nsps['/user'].controller.ingameUsers[user];

        for (var key in req.socket.nsps['/user'].controller.clients) {
            let client = req.socket.nsps['/user'].controller.clients[key];
            if (client.authToken.user === user) {
                req.socket.nsps['/user'].controller.setCharacter(req.socket, client, null);
            }
        }
        res.status(200).send();
    }

	onDuty = (req, res) => {
        let { user, character } = req.body;
		if (req.socket.nsps['/alerts'].controller.onlineServices[character.Job.job] == null) {
			req.socket.nsps['/alerts'].controller.onlineServices[character.Job.job] = Array();
        }

		req.socket.nsps['/alerts'].controller.onlineServices[character.Job.job].push({
            ...character,
            SessionId: `${user} ${character.ID}`,
			Status: 'unavailable',
            _id: character.ID
		});
        req.socket.nsps['/alerts'].io.emit('onlineChange');

		res.status(200).send();
	};

	offDuty = (req, res) => {
        let { job, user, charId } = req.body;
		if (req.socket.nsps['/alerts'].controller.onlineServices[job] != null) {
			req.socket.nsps['/alerts'].controller.onlineServices[job] = req.socket.nsps['/alerts'].controller.onlineServices[
				job
            ].filter((o) => o.SessionId !== `${user} ${charId}`);
            req.socket.nsps['/alerts'].io.emit('onlineChange');
        }

		res.status(200).send();
	};
}
