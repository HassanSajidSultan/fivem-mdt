import React, { useEffect } from 'react';
import { connect, useSelector } from 'react-redux';

import SearchSocket from './search';
import UserSocket from './user';
import JobSocket from './job';
import AlertsSocket from './alerts';

export default connect()((props) => {
	const token = useSelector(state => state.user.token);
	const session = useSelector(state => state.user.session);
    const character = useSelector(state => state.user.character);
	const userSocket = useSelector((state) => state.io.sockets.user);
	const searchSocket = useSelector((state) => state.io.sockets.search);
    const alertsSocket = useSelector(state => state.io.sockets.alerts);
	const jobSocket = useSelector(state => state.io.sockets.job);

	useEffect(() => {
		if (character) {
			if (searchSocket != null) {
				props.dispatch({
					type: 'REMOVE_SOCKET',
					payload: {
						key: 'search',
					},
				});
			}

			props.dispatch({
				type: 'ADD_SOCKET',
				payload: {
					key: 'search',
					socket: new SearchSocket(token),
				},
			});
		} else {
			if (searchSocket != null) {
				props.dispatch({
					type: 'REMOVE_SOCKET',
					payload: {
						key: 'search',
					},
				});
			}
		}
	}, [character]);

	useEffect(() => {
		if (token != null) {
			if (userSocket != null) {
				props.dispatch({
					type: 'REMOVE_SOCKET',
					payload: {
						key: 'user',
					},
				});
			}

			props.dispatch({
				type: 'ADD_SOCKET',
				payload: {
					key: 'user',
					socket: new UserSocket(),
				},
			});
		} else {
			if (userSocket != null) {
				props.dispatch({
					type: 'REMOVE_SOCKET',
					payload: {
						key: 'user',
					},
				});
			}
		}
	}, [token]);
	
	useEffect(() => {
        if (token != null && session != null && character != null) {
            if (alertsSocket == null || session.job !== alertsSocket.job && (session.job === 'police' && character.Job.callsign != null || session.job !== 'police')) {
                if (alertsSocket != null && session.job !== alertsSocket.job) {
                    props.dispatch({
                        type: 'REMOVE_SOCKET',
                        payload: {
                            key: 'alerts'
                        }
                    });
                }

                props.dispatch({
                    type: 'ADD_SOCKET',
                    payload: {
                        key: 'alerts',
                        socket: new AlertsSocket(token, session.job),
                    }
                });
            }
        } else {
            if (alertsSocket != null) {
                    props.dispatch({
                        type: 'REMOVE_SOCKET',
                        payload: {
                            key: 'alerts'
                        }
                    });
            }
        }
    }, [token, session, character]);

    useEffect(() => {
        if (token != null && session != null && character != null) {
            if (jobSocket == null || session.job !== jobSocket.job) {
                if (jobSocket != null && session.job !== jobSocket.job) {
                    props.dispatch({
                        type: 'REMOVE_SOCKET',
                        payload: {
                            key: 'job'
                        }
                    });
                }

                props.dispatch({
                    type: 'ADD_SOCKET',
                    payload: {
                        key: 'job',
                        socket: new JobSocket(token, session.job),
                    }
                });
            }
        } else {
            if (jobSocket != null) {
                    props.dispatch({
                        type: 'REMOVE_SOCKET',
                        payload: {
                            key: 'job'
                        }
                    });
            }
        }
    }, [token, session, character]);

    useEffect(() => {
        return () => {
            if (jobSocket != null) {
                props.dispatch({
                    type: 'REMOVE_SOCKET',
                    payload: {
                        key: 'job'
                    }
                });
            }
            if (alertsSocket != null) {
                props.dispatch({
                    type: 'REMOVE_SOCKET',
                    payload: {
                        key: 'alerts'
                    }
                });
            }
        }
    }, []);
	return (
		<>
		</>
	);
});
