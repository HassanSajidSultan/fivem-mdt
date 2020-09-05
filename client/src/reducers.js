import { combineReducers } from 'redux';

import userReducer from './sockets/userReducer';
import socketReducer from './sockets/socketReducer';
import alertsReducer from './sockets/alertsReducer';
import jobReducer from './sockets/jobReducer';

export default () =>
	combineReducers({
		user: userReducer,
		io: socketReducer,
		alerts: alertsReducer,
		job: jobReducer
	});
