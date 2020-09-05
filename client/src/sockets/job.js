import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { store } from '../';

export default class {
    io = null;
    job = null;
    constructor(token, job) {
        this.job = job;
        this.io = io(`${process.env.REACT_APP_SERVER_ADDRESS}${this.job}`, {
            query: `token=${token}`,
            forceNew: true,
        });

        this.cleanListeners();
        this.setupListeners();
    }

    cleanListeners = () => {
        this.io.off('alert');
        this.io.off('setData');
        this.io.off('addData');
        this.io.off('removeData');
        this.io.off('unauthorized');
    }

    setupListeners = () => {
        this.io.on('alert', (data) => {
            if (store.getState().job.notifications) {
                toast[data.type](data.message);
            }
        });

        this.io.on('setData', (data) => {
            store.dispatch({
                type: 'SET_JOB_DATA',
                payload: {
                    type: data.key,
                    data: data.value
                }
            });
        });

        this.io.on('addData', (data) => {
            store.dispatch({
                type: 'ADD_JOB_DATA',
                payload: {
                    type: data.key,
                    data: data.value
                }
            })
        });

        this.io.on('removeData', (data) => {
            store.dispatch({
                type: 'REMOVE_JOB_DATA',
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