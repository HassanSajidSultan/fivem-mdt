export const initialState = {
    show: true,
    hide: false
};

export default (state = initialState, action) => {
	switch (action.type) {
        case 'TOGGLE_SIDEBAR':
            return {
                ...state,
                show: !state.show,
            }
        case 'TOGGLE_SIDEBAR_VIS': {
            return {
                ...state,
                hide: !state.hide
            }
        }
		default:
			return state;
	}
};
