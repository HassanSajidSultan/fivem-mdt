import express from 'express';
import { SetPanicUnits, PanicUnits } from '../socket-controllers/alerts.js';

export default class {
	rootPath = '/alerts';
	router = express.Router();

	constructor() {
		this.initializeRoutes();
	}

	initializeRoutes() {
		this.router.post(`${this.rootPath}/panic`, this.panic);
		this.router.post(`${this.rootPath}/clearPanic`, this.clearPanic);
	}
	
	panic = (req, res) => {
        let { character } = req.body;
        SetPanicUnits(Array(...PanicUnits, character));
		if (req.socket.nsps['/alerts'].controller.onlineServices[character.Job.job] == null || req.socket.nsps['/alerts'].controller.onlineServices[character.Job.job].filter(o => o._id === character._id).length === 0) {
			if (req.socket.nsps['/alerts'].controller.onlineServices[character.Job.job] == null) {
				req.socket.nsps['/alerts'].controller.onlineServices[character.Job.job] = Array();
            }
            
			req.socket.nsps['/alerts'].controller.onlineServices[character.Job.job].push({
				...character,
				Status: 'offline',
			});
			req.socket.nsps['/alerts'].io.emit('onlineChange');
		}

		req.socket.nsps['/alerts'].io.emit('panic', {
			_id: character.ID,
			tone: true,
        });
        
		res.status(200).send();
	}
	
	clearPanic = (req, res) => {
        let { character } = req.body;
        
        SetPanicUnits(PanicUnits.filter(
			(p) => p._id !== character._id,
        ))

		let oData = req.socket.nsps['/alerts'].controller.onlineServices[character.Job.job].filter(o => o._id === character._id);
		if (oData.length > 0 && oData[0].Status === 'offline') {
			req.socket.nsps['/alerts'].controller.onlineServices[character.Job.job] = req.socket.nsps['/alerts'].controller.onlineServices[character.Job.job].filter(o => !(o._id === character._id && o.Status === 'offline'));
			req.socket.nsps['/alerts'].io.emit('onlineChange');
		}

		req.socket.nsps['/alerts'].io.emit('clearPanic', character._id);
		res.status(200).send();
	}
}