import sio from 'socket.io';
import socketJwt from 'socketio-jwt';
import mongodb from 'mongodb';
import { RefreshUser } from '../services/user.service.js';

let Connections = {};

const SessionId = () => {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (Math.random() * 16) | 0,
			v = c == 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

export default class {
	socket = null;
	nsps = Object();

	start = (server, controllers) => {
		this.socket = sio(server);

		controllers.forEach((controller) => {
			const ns = this.socket.of(controller.rootPath);
			Connections[controller.rootPath] = 0;

			if (controller.start != null) {
				controller.start(this);
			}

			if (controller.restricted) {
				ns.use(
					socketJwt.authorize({
						secret: process.env.JWT_SECRET,
						handshake: true,
						decodedPropertyName: 'authToken',
					}),
				);

				ns.use((client, next) => {
					if (!client.authToken.verified || !client.authToken.active) {
						RefreshUser(mongodb.ObjectID(client.authToken.account), (user) => {
							let err = new Error('Socket Authentication Error #1');
							err.data = { user: user };
							next(err);
						});
					}
					if (typeof controller.restricted === 'object') {
						if (controller.restricted.roles != null) {
							if (!controller.restricted.roles.includes(client.authToken.role)) {
								RefreshUser(mongodb.ObjectID(client.authToken.account), (user) => {
									let err = new Error('Socket Authentication Error #2');
									err.data = { user: user };
									next(err);
								});
							}
						}

						if (controller.restricted.jobs != null) {
							if (!controller.restricted.jobs.includes(client.authToken.job)) {
								RefreshUser(mongodb.ObjectID(client.authToken.account), (user) => {
									let err = new Error('Socket Authentication Error #3');
									err.data = { user: user };
									next(err);
								});
							}
						}

						if (controller.restricted.character && client.authToken.character == null) {
							RefreshUser(mongodb.ObjectID(client.authToken.account), (user) => {
								let err = new Error('Socket Authentication Error #4');
								err.data = { user: user };
								next(err);
							});
						}
					}

					next();
				});
			}

			ns.use((client, next) => {
				client.SessionId = SessionId();
				next();
			});

			ns.on('connection', (client) => {
				Connections[controller.rootPath]++;
				ns.emit('count', Connections[controller.rootPath]);

				if (controller.connect != null) controller.connect(this, client);

				controller.routes.forEach((route) => {
					client.on(route.route, (data, ack) => {
						route.method(this, client, data, ack);
					});
				});

				client.on('disconnect', () => {
					Connections[controller.rootPath]--;

					if (controller.disconnect != null) {
						controller.disconnect(this, client.SessionId, client.authToken);
					}

					ns.emit('count', Connections[controller.rootPath]);
				});
			});

			this.nsps[controller.rootPath] = {
				io: ns,
				controller: controller,
			};
		});

		return this.socket;
	};
}
