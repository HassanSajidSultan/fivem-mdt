import { GetGameDatabase } from '../services/database.service.js';
import mongodb from 'mongodb';

export let PanicUnits = [];
export const SetPanicUnits = (units) => {
	PanicUnits = units;
}

export default class {
	rootPath = '/search';
	restricted = {
		character: true,
	};
	count = 0;

	_tables = {
		'character': {
			table: 'characters',
			jobs: null
		},
		'criminal': {
			table: 'mdt_criminal_records',
			jobs: null,
		},
		'vehicle': {
			table: 'vehicles',
			jobs: ['police']
		},
		'firearm': {
			table: 'firerarms',
			jobs: ['police']
		},
		'warrant': {
			table: 'mdt_warrants',
			jobs: ['police', 'judge', 'lawyer'],
		},
		'incident': {
			table: 'mdt_reports',
			jobs: ['police', 'judge', 'lawyer']
		}
	}

	connect = async (server, client) => {
		this.count++;
	};

	disconnect = (server, session, token) => {
		this.count--;
	};

	search = async (server, client, data, cb) => {
		let searchData = this._tables[data.type]
		if (searchData != null) {
			if (searchData.jobs == null || searchData.jobs.includes(client.authToken.job)) {
				let game = await GetGameDatabase(client.authToken.character.Server);
				let res = Array();
				switch (data.type) {
					case 'character':
					case 'criminal':
						res = await game.db.collection(searchData.table).aggregate([
							{ $set: { name: { "$concat" : [ "$First", " ", "$Last" ] } } }, 
							{ $match: { "name": { $regex: new RegExp(data.value, 'i') } } },
						]).toArray();
						break;
					default:
						res = Array();
						break;
				}

				cb(res);
			} else {
				cb(Array());
			}
		} else {
			cb(Array());
		}
	}

	checkCrimProfile = async (server, client, data, cb) => {
		let game = await GetGameDatabase(client.authToken.character.Server);
		cb(await game.db.collection('mdt_criminal_records').findOne({
			Citizen: mongodb.ObjectID(data)
		}) != null);
	}

	routes = [
		{ route: `search`, method: this.search },
		{ route: `checkCrimProfile`, method: this.checkCrimProfile },
	];
}