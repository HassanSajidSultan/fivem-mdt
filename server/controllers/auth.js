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

	constructor() {
		this.initializeRoutes();
	}

	initializeRoutes() {
		this.router.post(`${this.rootPath}/register`, this.register);
		this.router.post(`${this.rootPath}/login`, this.login);
		this.router.post(`${this.rootPath}/verify`, this.verify);
	}
	
	register = async (req, res) => {
		const { email, username, password, code } = req.body;

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
            res.status(400).send({
				code: 'missing-field',
				error: 'Required Field Was Missing',
            });
		} else {
			const salt = await bcrypt.genSalt(10);
			const hPass = await bcrypt.hash(password, salt);

			try {
                if (await CheckEmail(email)) {
					if (await CheckUsername(username)) {
						let regClass = await CheckClassCode(+code);
						if (regClass != null) {
							CreateUser(email, username, hPass, regClass, () => {
                                res.status(201).send();
							});
						} else {
                            res.status(400).send({
								code: 'A03',
								error: 'Invalid Registration Code',
                            });
						}
					} else {
                        res.status(400).send({
							code: 'A02',
							error: 'Invalid Username',
                        });
					}
				} else {
                    res.status(400).send({
						code: 'A01',
						error: 'Invalid Email',
                    });
				}
			} catch (err) {
				console.log(err);
                res.status(400).send({
					code: 'unk',
					error: 'Unkown Error Occured',
                });
			}
		}
	};

	login = async (req, res) => {
		const { username, password, remember } = req.body;

		if (
			username == null ||
			username === '' ||
			password == null ||
			password === ''
		) {
            res.status(400).send({
				error: true,
				valid: false,
            });
		} else {
			if (!(await CheckUsername(username))) {
				GetUser(username, password, (user) => {
					if (!user) {
                        res.status(400).send({
                            error: true,
                        });
						return;
					}

					let tkn = jwt.sign(
						{
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
                        {
                            expiresIn: remember ? '7d' : '1d',
                            issuer: 'React Roleplay',
                            audience: 'React RP Members',
                            subject: 'System Authentication',
                        }
					);

                    res.status(202).send({
						token: tkn,
						account: user,
                    });
				});
			} else {
                res.status(400).send({
					error: true,
                });
			}
		}
	};

	verify = async (req, res) => {
		const { key } = req.body;

		if (key == null || key == '') {
            res.status(400).send();
			throw 'No Key Provided';
		}

		if (await CheckVerifyCode(mongodb.ObjectID(key))) {
			VerifyUserEmail(mongodb.ObjectID(key), (user) => {
				if (user != null) {
					let tkn = jwt.sign(
						{
							expires: '7d',
							account: user.account,
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

                    res.status(202).send({
                        token: tkn,
                        user: user
					});
				} else {
                    res.status(400).send();
				}
			});
		} else {
            res.status(400).send();
		}
	};
}