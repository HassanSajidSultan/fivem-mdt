export const initialState = {
    sockets: {},
};

export default (state = initialState, action) => {
	switch (action.type) {
		case 'ADD_SOCKET':
            console.log(`Add Socket ${action.payload.key}`);
            if (state.sockets[action.payload.key] != null) {
                state.sockets[action.payload.key].disconnect();
            } 
            return {
                ...state,
                sockets: {
                    ...state.sockets,
                    [action.payload.key]: action.payload.socket
                }
            };
        case 'REMOVE_SOCKET': {
            console.log(`Remove Socket ${action.payload.key}`);
            if (state.sockets[action.payload.key] != null) {
                state.sockets[action.payload.key].disconnect();
            }
            return {
                ...state,
                sockets: Object.keys(state.sockets).reduce((s, i) => {
                    if (i !== action.payload.key) {
                        s[i] = state.sockets[i];
                    }
                    return s;
                }, {})
            };
        }
		default:
			return state;
	}
};
