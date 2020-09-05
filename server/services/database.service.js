import MongoClient from 'mongodb';
import mongoLazy from 'mongo-lazy-connect';
import config from 'config';

const connections = {};

const GameDbIndexes = {
    characters: [
        {
            First: 'text',
            Last: 'text',
        },
        {
            User: 'text',
        }
    ]
}

class Database {
    db = null;
    url = null;
    dbName = null;
    options = {
        bufferMaxEntries:   0,
        useNewUrlParser:    true,
        useUnifiedTopology: true,
    }

    constructor(connString, db) {
        this.url = connString;
        this.dbName = db;
        this.db = mongoLazy(connString, this.options);
    }
}

var Auth = new Database(process.env.AUTH_DB, 'auth');
export default Auth;

export const GetGameDatabase = async (key) => {
    if (connections[`${key}`]) {
        return connections[`${key}`];
    } else {
        let conf = config.get('servers').filter(s => s.id === key)[0];
        connections[`${key}`] = new Database(conf.connString, conf.db);
        return connections[`${key}`];
    }
}