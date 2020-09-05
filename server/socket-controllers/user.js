import qs from 'qs';
import axios from 'axios';
import mongodb from 'mongodb';
import config from 'config';
import jwt from 'jsonwebtoken';

import { GetGameDatabase } from '../services/database.service.js';
import { SetPanicUnits, PanicUnits } from './alerts.js';

import {
	CheckCommunityAccount,
	LinkCommunityAccount,
	CheckCommunityAccountGame,
	RefreshUser,
	ResetVerifyLink,
	CheckToken,
	StoreUserTheme,
} from '../services/user.service.js';

export default class {
	rootPath = '/user';
	restricted = true;
	count = 0;
	_cachedChars = Object();
	clients = {};
	ingameUsers = {};

	start = async (server) => {
		let res = await axios.get('http://localhost:1337/info/characters');
		res.data.map(char => {
			this.ingameUsers[char.User] = {
				...char,
				_id: char.ID
			};
		});
	}

	connect = (server, client) => {
		this.count++;
		this.clients[client.SessionId] = client;
	};

	disconnect = (server, session, token) => {
		this.count--;
		delete this.clients[session];
	};

	clientDisconnect = (server, client, data, cb) => {
		console.log(`${this.rootPath} ${client.authToken.account} Disconnected`);
		delete this.clients[client.SessionId];
	};

	logout = (server, client, data, cb) => {
		console.log(`${client.authToken.account} Logged Out`);
		this._cachedChars[client.authToken.user] = null;
	};

	changeTheme = (server, client, data, cb) => {
		StoreUserTheme(client.authToken.account, data);
	};

	resendEmailVerify = async (server, client, data, cb) => {
		if (
			client.authToken != null &&
			client.authToken.account != null &&
			client.authToken.email != null &&
			client.authToken.username != null
		) {
			ResetVerifyLink(
				mongodb.ObjectID(client.authToken.account),
				client.authToken.email,
				client.authToken.username,
				(status) => {
					client.emit('resendVerifyFeedback', status);
				},
			);
		} else {
			client.emit('resendVerifyFeedback');
		}
	};

	getPersonalDetails = async (server, client, data, cb) => {
		RefreshUser(mongodb.ObjectID(client.authToken.account), (user) => {
			CheckToken(client.authToken, user, (refresh) => {
				let tkn = null;
				if (refresh != null) {
					tkn = jwt.sign(
						{
							expires: client.authToken.expires,
							...refresh,
							character: data,
						},
						process.env.JWT_SECRET,
					);
				}

				let status =
					client.authToken.character != null
						? server.nsps['/alerts'].controller.onlineServices[client.authToken.job] != null
							? server.nsps['/alerts'].controller.onlineServices[client.authToken.job].filter(
									(o) => o._id === client.authToken.character._id,
							  ).length > 0
								? server.nsps['/alerts'].controller.onlineServices[client.authToken.job].filter(
										(o) => o._id === client.authToken.character._id,
								  )[0].Status
								: 'offline'
							: 'offline'
						: 'offline';

				client.emit('setPersonalDetails', {
					user: user,
					token: tkn,
					status: status,
					ingame: this.ingameUsers[client.authToken.user] != null && client.authToken.character != null
							? this.ingameUsers[client.authToken.user]._id === client.authToken.character._id
							: false,
				});
			});
		});
	};

	link = (server, client, data, cb) => {
		const { username, password } = data;
		
		if (username == null || username === '' || password == null || password === '') {
			client.emit('linkFeedback');
		} else {
			axios
				.post(
					process.env.OAuth_Endpoint,
					qs.stringify({
						grant_type: 'password',
						username: username,
						password: password,
						scope: process.env.OAuth_Scope,
						client_id: process.env.OAuth_Client_Id,
						client_secret: process.env.OAuth_Client_Secret,
					}),
					{
						'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
					},
				)
				.then((data) => {
					axios
						.get(`${process.env.API_ADDRESS}core/me`, {
							headers: {
								Authorization: `Bearer ${data.data.access_token}`,
							},
							withCredentials: true,
						})
						.then(async (userData) => {
							let gameAcc = await CheckCommunityAccountGame(userData.data.id);

							if (gameAcc != null) {
								if (await CheckCommunityAccount(userData.data.id)) {
									LinkCommunityAccount(
										mongodb.ObjectID(client.authToken.account),
										gameAcc._id,
										userData.data.id,
										(status) => {
											RefreshUser(mongodb.ObjectID(client.authToken.account), (user) => {
												let tkn = jwt.sign(user, process.env.JWT_SECRET);

												client.emit('linkFeedback', {
													token: tkn,
													user: user,
												});
											});
										},
									);
								} else {
								}
							} else {
								client.emit('linkFeedback');
							}
						})
						.catch((err) => {
							console.log(err);
							client.emit('linkFeedback');
						});
				})
				.catch((err) => {
					console.log(err);
					client.emit('linkFeedback');
				});
		}
	};

	getCharacters = async (server, client, data, cb) => {
		if (this.ingameUsers[client.authToken.user] != null) {
			this.setCharacter(server, client, this.ingameUsers[client.authToken.user])
			return;
		}

		if (
			this._cachedChars[client.authToken.user] == null ||
			this._cachedChars[client.authToken.user].time + 1000 * 60 * 10 < Date.now()
		) {
			console.log(`Fetching Characters For ${client.authToken.user}`);
			let chars = Object();
			await Promise.all(
				config.get('servers').map(async (server, i) => {
					let db = await GetGameDatabase(server.id);

					let sChars = await db.db
						.collection('characters')
						.find({
							User: client.authToken.user
						})
						.toArray();

					chars[server.id] = Array();

					for (let i = 0; i < sChars.length; i++) {
						let char = sChars[i];
						chars[server.id].push({
							_id: char._id,
							User: char.User,
							Server: server.id,
							First: char.First,
							Last: char.Last,
							Phone: char.Phone,
							DOB: char.DOB,
							Gender: char.Gender,
							Job: char.Job,
							JobDuty: char.JobDuty,
							InGame: this.ingameUsers[char.User] != null && this.ingameUsers[char.User]._id === char._id.toString()
						});
					}
				}),
			);

			this._cachedChars[client.authToken.user] = {
				time: Date.now(),
				job: client.authToken.job,
				characters: chars,
			};

			client.emit('receiveCharacters', chars);
		} else {
			console.log(`Using Cached Characters For ${client.authToken.user}`);

			Object.keys(this._cachedChars[client.authToken.user].characters).map((key, i) => {
				let chars = this._cachedChars[client.authToken.user].characters[key];
				chars.map((char) => {
					char.InGame = this.ingameUsers[char.User] != null && this.ingameUsers[char.User]._id === char._id.toString()
				});
			});

			client.emit('receiveCharacters', this._cachedChars[client.authToken.user].characters);
		}
	};

	setCharacter = (server, client, data, cb) => {
		RefreshUser(mongodb.ObjectID(client.authToken.account), (user) => {
			let tkn = jwt.sign(
				{
					expires: client.authToken.expires,
					...user,
					character: data,
				},
				process.env.JWT_SECRET,
			);

			client.emit('setCharacter', {
				token: tkn,
				character: data,
				ingame: data != null && this.ingameUsers[client.authToken.user] != null
				? this.ingameUsers[client.authToken.user]._id === data._id
				: false,
			});

			if (
				client.authToken.character != null &&
				(data == null || data._id !== client.authToken.character._id) &&
				PanicUnits.filter((p) => p._id === client.authToken.character._id).length > 0
			) {
				SetPanicUnits(PanicUnits.filter((p) => p._id !== client.authToken.character._id));
				server.nsps['/alerts'].io.emit('clearPanic', client.authToken.character._id);
			}

			Object.keys(this.clients).map((index) => {
				let sClient = this.clients[index];
				if (
					sClient.connected &&
					index !== client.SessionId &&
					sClient.authToken.account === client.authToken.account
				) {
					sClient.emit('forceChangeCharacter', {
						token: tkn,
						character: data,
						ingame: data != null && this.ingameUsers[client.authToken.user] != null
						? this.ingameUsers[client.authToken.user]._id === data._id
						: false,
					});
				}
			});
		});
	};

	routes = [
		//{ route: 'disconnect', method: this.clientDisconnect },
		{ route: 'logout', method: this.logout },
		{ route: 'changeTheme', method: this.changeTheme },
		{ route: 'resendVerify', method: this.resendEmailVerify },
		{ route: 'getPersonalDetails', method: this.getPersonalDetails },
		{ route: 'link', method: this.link },
		{ route: 'getCharacters', method: this.getCharacters },
		{ route: 'setCharacter', method: this.setCharacter },
	];
}
