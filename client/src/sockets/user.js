import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { replace } from 'react-router-redux';
import { store } from '../';
import { customHistory } from '../MDT';

export default class {
    io = null;
    constructor() {
        let state = store.getState().user;
        this.io = io(`${process.env.REACT_APP_SERVER_ADDRESS}user`, {
            query: `token=${state.token}`,
            forceNew: true,
        });

        this.cleanListeners();
        this.setupListeners();
        this.io.emit('getPersonalDetails');
    }

    cleanListeners = () => {
        this.io.off('rejected');
        this.io.off('spawnedGame');
        this.io.off('leftGame');
        this.io.off('setPersonalDetails');
        this.io.off('setCharacter');
        this.io.off('forceChangeCharacter');
        this.io.off('setData');
        this.io.off('unauthorized');
    }

    setupListeners = () => {
		this.io.on('spawnedGame', (charId) => {
			store.dispatch({
                type: 'SET_INGAME_STATUS',
                payload: {
                    time: Date.now(),
                    character: charId
                }
            })
        });

		this.io.on('leftGame', () => {
			store.dispatch({
                type: 'SET_INGAME_STATUS',
                payload: null
            })
        });
        
        this.io.on('setPersonalDetails', (data) => {
            if (data.token == null) {
                store.dispatch({
                    type: 'SET_USER_DATA',
                    payload: data.user,
                });
            }

            if (data.ingame != null) {
                store.dispatch({
                    type: 'SET_INGAME_STATUS',
                    payload: data.ingame,
                });
            }
        });

        this.io.on('setCharacter', (data) => {
			store.dispatch({
				type: 'LOGIN',
				payload: { token: data.token, character: { data: data.character } },
			});
            store.dispatch({
                type: 'SET_INGAME_STATUS',
                payload: data.ingame
            });
            
            customHistory.replace(data.character != null ? '/' : '/characters');
            if (data.character != null) toast.success(`Welcome ${data.character.First} ${data.character.Last}`);
        });

        this.io.on('forceChangeCharacter', (data) => {
            store.dispatch({
                type: 'LOGIN',
                payload: {
                    token: data.token
                },
            });
            store.dispatch({
                type: 'SET_INGAME_STATUS',
                payload: data.ingame
            });
            store.dispatch({
                type: 'SET_CHARACTER',
                payload: {
                    character: data.character
                }
            });
            
            customHistory.replace(data.character != null ? '/' : '/characters');
            if (data.character != null) toast.success(`Welcome ${data.character.First} ${data.character.Last}`);
        });

        this.io.on('setData', (data) => {
            store.dispatch({
                type: 'SET_JOB_DATA',
                payload: {
                    type: data.key,
                    data: data.value
                }
            })
        });

        this.io.on('error', (err) => {
            if (err.user != null)
            store.dispatch({
                type: 'SET_USER_DATA',
                payload: err.user,
            });
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
        //this.io.emit('disconnect');
        this.io.disconnect();
    }
}