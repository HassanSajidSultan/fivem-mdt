import io from 'socket.io-client';
import { store } from '../';

export default class {
    io = null;
    constructor(token) {
        this.io = io(`${process.env.REACT_APP_SERVER_ADDRESS}search`, {
            query: `token=${token}`,
            forceNew: true,
        });

        this.cleanListeners();
        this.setupListeners();
    }

    cleanListeners = () => {
        this.io.off('unauthorized');
    }

    setupListeners = () => {
        this.io.on('unauthorized', (err, cb) => {
            store.dispatch({
                type: 'LOGOUT',
            });
            cb();
        });
    }

    disconnect = () => {
        this.cleanListeners();
        this.io.disconnect();
    }
}