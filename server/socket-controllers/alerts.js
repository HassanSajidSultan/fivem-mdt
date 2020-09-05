import { GetGameDatabase } from '../services/database.service.js';
import mongodb from 'mongodb';
import axios from 'axios';

export let PanicUnits = [];
export const SetPanicUnits = (units) => {
	PanicUnits = units;
};

export default class {
	rootPath = '/alerts';
	restricted = {
		character: true,
		jobs: ['police', 'ems'],
	};
	count = 0;
	onlineServices = Object();

	connect = async (server, client) => {
		this.count++;

		client.emit('initPanic', PanicUnits);
		client.join(client.authToken.job);
		client.join('alerts');

		let game = await GetGameDatabase(client.authToken.character.Server);
		let bolos = await game.db.collection('mdt_bolos').find({
			time: { $gt: Date.now() - (1000 * 60 * 60 * 24 * 30) }
		}).toArray();
		client.emit('setData', {
			key: 'bolo',
			value: bolos,
		});
		client.emit('setData', {
			key: 'online',
			value:
				client.authToken.character != null
					? Object.keys(this.onlineServices)
							.filter((key) =>
								this.onlineServices[key].filter((o) => o.Server === client.authToken.character.Server),
							)
							.reduce((obj, key) => {
								obj[key] = this.onlineServices[key];
								return obj;
							}, {})
					: Object(),
		});

		// if (this.onlineServices[client.authToken.job] == null) {
		// 	this.onlineServices[client.authToken.job] = Array();
		// }
		// this.onlineServices[client.authToken.job].push({
		// 	SessionId: client.SessionId,
		// 	Status: 'unavailable',
		// 	...client.authToken.character,
		// });
		// server.nsps[this.rootPath].io.emit('onlineChange');
	};

	disconnect = (server, session, token) => {
		this.count--;
		// if (this.onlineServices[token.job] != null) {
		// 	this.onlineServices[token.job] = this.onlineServices[
		// 		token.job
		// 	].filter((o) => o.SessionId !== session);
		// }
		// server.nsps[this.rootPath].io.emit('onlineChange');
	};

	onDuty = (server, client, data, cb) => {
		if (this.onlineServices[client.authToken.job] == null) {
			this.onlineServices[client.authToken.job] = Array();
		}

		this.onlineServices[client.authToken.job].push({
			...data,
			SessionId: client.SessionId,
			Status: 'unavailable',
		});
		server.nsps[this.rootPath].io.emit('onlineChange');
	};

	offDuty = (server, client, data, cb) => {
		this.onlineServices[client.authToken] = this.onlineServices[client.authToken].filter(
			(o) => o.SessionId !== client.SessionId,
		);
		server.nsps[this.rootPath].io.emit('onlineChange');
	};

	getOnline = (server, client, data, cb) => {
		client.emit('setData', {
			key: 'online',
			value:
				client.authToken.character != null
					? Object.keys(this.onlineServices).reduce((obj, key) => {
							obj[key] = this.onlineServices[key].filter(
								(o) => o.Server === client.authToken.character.Server,
							);
							return obj;
					  }, {})
					: Object(),
		});
	};

	updateStatus = (server, client, data, cb) => {
		if (this.onlineServices[client.authToken.job] == null) return;

		this.onlineServices[client.authToken.job] = this.onlineServices[client.authToken.job].map((u) => {
			if (u._id === client.authToken.character._id) {
				u.Status = data;
			}
			return u;
		});
		server.nsps[this.rootPath].io.emit('onlineChange');
	};

	alert = (server, client, data, cb) => {
		server.nsps[this.rootPath].io.emit('alert', data);
	};

	panic = (server, client, data, cb) => {
		PanicUnits.push({
			_id: client.authToken.character._id,
		});

		if (
			this.onlineServices[client.authToken.job] == null ||
			this.onlineServices[client.authToken.job].filter((o) => o._id === client.authToken.character._id).length ===
				0
		) {
			if (this.onlineServices[client.authToken.job] == null) {
				this.onlineServices[client.authToken.job] = Array();
			}

			this.onlineServices[client.authToken.job].push({
				...client.authToken.character,
				Status: 'offline',
			});
			server.nsps[this.rootPath].io.emit('onlineChange');
		}

		axios.post('http://localhost:1337/mdt/panic', {
			source: client.authToken.character.Source,
		});

		server.nsps[this.rootPath].io.emit('panic', {
			_id: client.authToken.character._id,
			tone: true,
		});
	};

	clearPanic = (server, client, data, cb) => {
		PanicUnits = PanicUnits.filter((p) => p._id !== client.authToken.character._id);

		let oData = this.onlineServices[client.authToken.job].filter((o) => o._id === client.authToken.character._id);
		if (oData.length > 0 && oData[0].Status === 'offline') {
			this.onlineServices[client.authToken.job] = this.onlineServices[client.authToken.job].filter(
				(o) => !(o._id === client.authToken.character._id && o.Status === 'offline'),
			);
			server.nsps[this.rootPath].io.emit('onlineChange');
		}

		server.nsps[this.rootPath].io.emit('clearPanic', client.authToken.character._id);
	};

	bolo = async (server, client, data, cb) => {
		let gameDb = await GetGameDatabase(client.authToken.character.Server);
		let doc = {
			...data,
			active: true,
			author: {
				_id: client.authToken.character._id,
				name: `${client.authToken.character.First} ${client.authToken.character.Last}`,
				title: `${client.authToken.character.Job.workplace.label} ${client.authToken.character.Job.grade.label}`,
			},
			history: Array({
				action: 'create',
				time: Date.now(),
				user: client.authToken.character._id,
				message: `${client.authToken.character.First} ${client.authToken.character.Last} Created BOLO`,
			}),
		};

		let res = await gameDb.db.collection('mdt_bolos').insertOne(doc);
		server.nsps[this.rootPath].io.emit('addData', {
			key: 'bolo',
			value: {
				_id: res.insertedId,
				...doc,
			},
			first: true,
		});

		server.nsps[this.rootPath].io.in('alerts').emit('alert', {
			type: 'info',
			message: 'New BOLO Activated',
		});
	};

	editBolo = async (server, client, data, cb) => {
		let gameDb = await GetGameDatabase(client.authToken.character.Server);

		gameDb.db.collection('mdt_bolos').findOneAndUpdate(
			{
				_id: mongodb.ObjectID(data._id),
			},
			{
				$set: { title: data.title, description: data.description, event: data.event, type: data.type },
				$push: {
					history: {
						$each: [
							{
								action: 'edit',
								time: Date.now(),
								user: client.authToken.character._id,
								message: `${client.authToken.character.First} ${client.authToken.character.Last} Edited BOLO`,
							},
						],
					},
				},
			},
			{ returnOriginal: false },
			(err, result) => {
				if (cb != null) cb();
				server.nsps[this.rootPath].io.emit('updateData', {
					key: 'bolo',
					value: data._id,
					data: result.value,
				});
			},
		);
	};

	viewBolo = async (server, client, data, cb) => {
		let gameDb = await GetGameDatabase(client.authToken.character.Server);
	};

	dismissBolo = async (server, client, data, cb) => {
		let gameDb = await GetGameDatabase(client.authToken.character.Server);

		gameDb.db.collection('mdt_bolos').findOneAndUpdate(
			{
				_id: mongodb.ObjectID(data._id),
			},
			{
				$set: { active: false },
				$push: {
					history: {
						$each: [
							{
								action: 'deactivate',
								time: Date.now(),
								user: client.authToken.character._id,
								message: `${client.authToken.character.First} ${client.authToken.character.Last} Deactivasted BOLO`,
							},
						],
					},
				},
			},
			{ returnOriginal: false },
			(err, result) => {
				if (cb != null) cb();
				server.nsps[this.rootPath].io.emit('updateData', {
					key: 'bolo',
					value: data._id,
					data: result.value,
				});
			},
		);
	};

	activateBolo = async (server, client, data, cb) => {
		let gameDb = await GetGameDatabase(client.authToken.character.Server);

		gameDb.db.collection('mdt_bolos').findOneAndUpdate(
			{
				_id: mongodb.ObjectID(data._id),
			},
			{
				$set: { active: true, time: Date.now() },
				$push: {
					history: {
						$each: [
							{
								action: 'reactivate',
								time: Date.now(),
								user: client.authToken.character._id,
								message: `${client.authToken.character.First} ${client.authToken.character.Last} Activated BOLO`,
							},
						],
					},
				},
			},
			{ returnOriginal: false },
			(err, result) => {
				if (cb != null) cb();
				server.nsps[this.rootPath].io.emit('updateData', {
					key: 'bolo',
					value: data._id,
					data: result.value,
				});
			},
		);
	};

	routes = [
		{ route: `getOnline`, method: this.getOnline },
		{ route: `updateStatus`, method: this.updateStatus },
		{ route: `alert`, method: this.alert },
		{ route: `panic`, method: this.panic },
		{ route: `clearPanic`, method: this.clearPanic },
		{ route: `createBolo`, method: this.bolo },
		{ route: `editBolo`, method: this.editBolo },
		{ route: `dismissBolo`, method: this.dismissBolo },
		{ route: `activateBolo`, method: this.activateBolo },
	];
}
