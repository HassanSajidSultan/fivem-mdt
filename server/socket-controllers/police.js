import mongodb from 'mongodb';
import jwt from 'jsonwebtoken';
import { GetGameDatabase } from '../services/database.service.js';

import { RefreshUser } from '../services/user.service.js';

const Callsigns = Array(
	{ sign: 'Alpha', restrict: 0 },
	{ sign: 'Bravo', restrict: 0 },
	{ sign: 'Charlie', restrict: 4 },
	{ sign: 'Delta', restrict: 0 },
	{ sign: 'Echo', restrict: 0 },
	{ sign: 'Foxtrot', restrict: 0 },
	{ sign: 'Golf', restrict: 0 },
	{ sign: 'Hotel', restrict: 8 },
	{ sign: 'India', restrict: 0 },
	{ sign: 'Juliet', restrict: 0 },
	{ sign: 'Kilo', restrict: 0 },
	{ sign: 'Lima', restrict: 0 },
	{ sign: 'Mike', restrict: 0 },
	{ sign: 'November', restrict: 0 },
	{ sign: 'Oscar', restrict: 0 },
	{ sign: 'Papa', restrict: 0 },
	{ sign: 'Quebec', restrict: 0 },
	{ sign: 'Romeo', restrict: 0 },
	{ sign: 'Sierra', restrict: 3 },
	{ sign: 'Tango', restrict: 0 },
	{ sign: 'Uniform', restrict: 0 },
	{ sign: 'Victor', restrict: 0 },
	{ sign: 'Whiskey', restrict: 0 },
	{ sign: 'X-Ray', restrict: 0 },
	{ sign: 'Yankee', restrict: 0 },
	{ sign: 'Zulu', restrict: 0 },
);

export default class {
	rootPath = '/police';
	restricted = {
		character: true,
		jobs: ['police'],
	};
	count = 0;

	connect = async (server, client) => {
		this.count++;
		client.join('alerts');
	};

	disconnect = (server, session, token) => {
		this.count--;
	};

	alert = (server, client, data, cb) => {
		server.nsps[this.rootPath].io.emit('alert', data);
	};

	getCallsignData = async (server, client, data, cb) => {
		let game = await GetGameDatabase(client.authToken.character.Server);
		client.emit(
			'receiveCallsignData',
			Callsigns.filter((c) => c.restrict <= client.authToken.character.Job.grade.level).sort(
				(a, b) => b.restrict - a.restrict,
			),
		);
	};

	getCallsignIds = async (server, client, data, cb) => {
		let game = await GetGameDatabase(client.authToken.character.Server);
		let idents = await game.db
			.collection('characters')
			.find({
				'Job.job': 'police',
				'Job.callsign.sign': data,
			})
			.toArray();

		let used = Array();

		idents.forEach((char) => {
			used.push(char.Job.callsign);
		});

		client.emit('receiveCallsignIds', used);
	};

	setCallsign = async (server, client, data, cb) => {
		let game = await GetGameDatabase(client.authToken.character.Server);
		game.db.collection('characters').findOneAndUpdate(
			{
				_id: mongodb.ObjectID(client.authToken.character._id),
			},
			{
				$set: {
					'Job.callsign': data,
				},
			},
			{ returnOriginal: false },
			(err, res) => {
				if (err) {
					client.emit('setCallsignFeedback');
					throw err;
                }

				RefreshUser(mongodb.ObjectID(client.authToken.account), (user) => {
					let tkn = jwt.sign(
						{
							expires: client.authToken.expires,
							...user,
							character: {
                                ...res.value,
                                Server: client.authToken.character.Server
                            },
						},
						process.env.JWT_SECRET,
                    );
                    
                    delete server.nsps['/user'].controller._cachedChars[client.authToken.user];

					client.emit('setCallsignFeedback', {
						token: tkn,
						character: res.value,
					});
				});
			},
		);
	};

	createCriminal = async (server, client, data, cb) => {
		let game = await GetGameDatabase(client.authToken.character.Server);
		game.db.collection('mdt_criminal_records').findOne({
			_id: mongodb.ObjectID(data.character._id)
		}, (err, res) => {
			if (res == null) {
				game.db.collection('mdt_criminal_records').insertOne({
						Citizen: mongodb.ObjectID(data.character._id),
						First: data.character.First,
						Last: data.character.Last,
						Mugshot: data.mugshot,
						Flags: {
							Violent: data.violent,
							Drugs: data.drugs,
							Mental: data.mental
						},
						Race: data.race,
						BodyType: data.bodyType
					}, (err, res) => {
						cb(res.insertedId);
					});
			} else {
				cb();
			}
		})
	}

	routes = [
		{ route: `alert`, method: this.alert },
		{ route: 'getCallsignData', method: this.getCallsignData },
		{ route: 'getCallsignIds', method: this.getCallsignIds },
		{ route: 'setCallsign', method: this.setCallsign },
		{ route: 'createCriminal', method: this.createCriminal },
	];
}
