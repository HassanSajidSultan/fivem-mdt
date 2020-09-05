import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { store } from '../';

export default class {
    io = null;
    job = null;
    constructor(token, job) {
        this.job = job;
        this.io = io(`${process.env.REACT_APP_SERVER_ADDRESS}alerts`, {
            query: `token=${token}`,
            forceNew: true,
        });

        this.cleanListeners();
        this.setupListeners();
    }

    cleanListeners = () => {
        this.io.off('onlineChange');
        this.io.off('alert');
        this.io.off('initPanic');
        this.io.off('panic');
        this.io.off('clearPanic');
        this.io.off('setData');
        this.io.off('updateData');
        this.io.off('addData');
        this.io.off('removeData');
        this.io.off('unauthorized');
    }

    setupListeners = () => {
        this.io.on('onlineChange', (data) => {
            this.io.emit('getOnline');
        });

        this.io.on('alert', (data) => {
            if (store.getState().job.notifications) {
                toast[data.type](data.message);
            }
        });

        this.io.on('initPanic', (data) => {
            store.dispatch({
                type: 'SET_PANIC',
                payload: data
            });
        });

        this.io.on('panic', (data) => {
            store.dispatch({
                type: 'ADD_PANIC',
                payload: data
            });
        });

        this.io.on('clearPanic', (data) => {
            store.dispatch({
                type: 'REMOVE_PANIC',
                payload: data
            });
        });

        this.io.on('setData', (data) => {
            store.dispatch({
                type: 'SET_ALERT_DATA',
                payload: {
                    type: data.key,
                    data: data.value
                }
            });
        });

        this.io.on('addData', (data) => {
            store.dispatch({
                type: 'ADD_ALERT_DATA',
                payload: {
                    type: data.key,
                    data: data.value
                }
            })
        });

        this.io.on('updateData', (data) => {
            console.log(data);
            store.dispatch({
                type: 'UPDATE_ALERT_DATA',
                payload: {
                    type: data.key,
                    id: data.value,
                    data: data.data
                }
            })
        });

        this.io.on('removeData', (data) => {
            store.dispatch({
                type: 'REMOVE_ALERT_DATA',
                payload: {
                    type: data.key,
                    id: data.value
                }
            })
        });

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