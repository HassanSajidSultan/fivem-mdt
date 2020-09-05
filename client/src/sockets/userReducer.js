export const initialState = {
	token: localStorage.getItem('token'),
	session: null,
	sessionLoaded: false,
	ingame: null,
	characters: null,
	character: localStorage.getItem('character') != null ? JSON.parse(localStorage.getItem('character')) : null,
	mode: localStorage.getItem('mode') != null ? localStorage.getItem('mode') : 'dark'
};

export default (state = initialState, action) => {
	switch (action.type) {
		case 'LOGIN':
			if (action.payload.noStore == null) {
				localStorage.setItem('token', action.payload.token);
			}

			if (action.payload.character != null) {
				localStorage.setItem('character', JSON.stringify(action.payload.character.data));
			}
			return {
				...state,
				token: action.payload.token,
				session:
					action.payload.user != null
						? action.payload.user
						: state.session,
				character:
					action.payload.character != null
						? action.payload.character.data
						: state.character,
			};
		case 'LOGOUT':
			localStorage.removeItem('token');
			localStorage.removeItem('character');
			return {
				...state,
				token: null,
				session: null,
				character: null,
			};
		case 'SET_INGAME_STATUS':
			return {
				...state,
				ingame: action.payload
			}
		case 'SET_USER_DATA':
			return {
				...state,
				session: action.payload,
				sessionLoaded: true,
				mode: action.payload && action.payload.mode ? action.payload.mode : (localStorage.getItem('mode') != null ? localStorage.getItem('mode') : 'dark')
			};
		case 'SET_CHARACTERS':
			return {
				...state,
				characters: action.payload,
			};
		case 'SET_CHARACTER':
			if (action.payload.noStore == null) {
				if (action.payload.character != null) {
					localStorage.setItem('character', JSON.stringify(action.payload.character));
				} else {
					localStorage.removeItem('character');
				}
			}
			return {
				...state,
				character: action.payload.character,
			};
		case 'CLEAR_CHARACTER':
			localStorage.removeItem('character');
			return {
				...state,
				character: null,
			};
		case 'SET_THEME':
			localStorage.setItem('mode', action.payload);
			return {
				...state,
				mode: action.payload
			}
		default:
			return state;
	}
};