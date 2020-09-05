import express from 'express';
import mongodb from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import {
	CheckEmail,
	CheckUsername,
	CheckClassCode,
	CheckVerifyCode,
	CreateUser,
	VerifyUserEmail,
	GetUser,
} from '../services/user.service.js';

export default class {
	rootPath = '/auth';
	router = express.Router();
	count = 0;

    connect = async (server, client) => {
        this.count++;
    };

    disconnect = (server, session, token) => {
        this.count--;
    }

	register = async (server, client, data, cb) => {
		const { email, username, password, code } = data;

		if (
			email == null ||
			email === '' ||
			username == null ||
			username === '' ||
			password == null ||
			password === '' ||
			code == null ||
			code === ''
		) {
			client.emit('registerFeedback', {
				code: 'missing-field',
				error: 'Required Field Was Missing',
			});
		} else {
			const salt = await bcrypt.genSalt(10);
			const hPass = await bcrypt.hash(password, salt);

			try {
				if (await CheckEmail(email)) {
					if ((await CheckUsername(username)) != null) {
						let regClass = await CheckClassCode(+code);
						if (regClass != null) {
							CreateUser(email, username, hPass, regClass, () => {
								client.emit('registerFeedback');
							});
						} else {
							client.emit('registerFeedback', {
								code: 'A03',
								error: 'Invalid Registration Code',
							});
						}
					} else {
						client.emit('registerFeedback', {
							code: 'A02',
							error: 'Invalid Username',
						});
					}
				} else {
					client.emit('registerFeedback', {
						code: 'A01',
						error: 'Invalid Email',
					});
				}
			} catch (err) {
				console.log(err);
				client.emit('registerFeedback', {
					code: 'unk',
					error: 'Unkown Error Occured',
				});
			}
		}
	};

	login = async (server, client, data, cb) => {
		const { username, password } = data;

		if (
			username == null ||
			username === '' ||
			password == null ||
			password === ''
		) {
			client.emit('loginFeedback', {
				error: true,
				valid: false,
			});
		} else {
			if (!(await CheckUsername(username))) {
				GetUser(username, password, (user) => {
					if (!user) {
						client.emit('loginFeedback', {
							error: true,
						});
						return;
					}

					let tkn = jwt.sign(
						{
							expires: '7d',
							account: user._id,
							email: user.email,
							username: user.username,
							role: user.role,
							job: user.job,
							user: user.user != null ? user.user : null,
							sid: user.sid != null ? user.sid : null,
							active: user.active,
							verified: user.verified,
						},
						process.env.JWT_SECRET,
					);

					client.emit('loginFeedback', {
						token: tkn,
						account: user,
					});
				});
			} else {
				client.emit('loginFeedback', {
					error: true,
				});
			}
		}
	};

	verify = async (server, client, data, cb) => {
		const { key } = data;

		if (key == null || key == '') {
			client.emit('verifyFeedback');
			throw 'No Key Provided';
		}

		if (await CheckVerifyCode(mongodb.ObjectID(key))) {
			VerifyUserEmail(mongodb.ObjectID(key), (data) => {
				if (data != null) {
					let tkn = jwt.sign(
						{
							expires: '7d',
							account: data.account,
							email: data.email,
							username: data.username,
							role: data.role,
							job: data.job,
							user: data.user != null ? data.user : null,
							sid: data.sid != null ? data.sid : null,
							active: data.active,
							verified: data.verified,
						},
						process.env.JWT_SECRET,
					);

					client.emit('loginFeedback', {
						token: tkn,
					});
					client.emit('verifyFeedback', data);
				} else {
					client.emit('verifyFeedback');
				}
			});
		} else {
			client.emit('verifyFeedback');
		}
	};

	routes = [
		{ route: `register`, method: this.register },
		{ route: `verify`, method: this.verify },
		{ route: `login`, method: this.login },
	];
}