export const initialState = {
	data: {},
	status: 'offline',
	notifications:
		localStorage.getItem('jobNotifs') != null
			? localStorage.getItem('jobNotifs')
			: true,
	alerts: {
		panic: [],
	}
};

export default (state = initialState, action) => {
	switch (action.type) {
		case 'TOGGLE_ALERT_NOTIFICATIONS': {
			localStorage.setItem('jobNotifs', !state.notifications);
			return {
				...state,
				notifications: !state.notifications,
			};
		}
		case 'SET_PANIC':
			return {
				...state,
				alerts: {
					...state.alerts,
					panic: action.payload,
				},
			};
		case 'ADD_PANIC':
			return {
				...state,
				alerts: {
					...state.alerts,
					panic: [...state.alerts.panic, action.payload],
				}
			};
		case 'PANIC_TONE_PLAYED':
			return {
				...state,
				alerts: {
					...state.alerts,
					panic: state.alerts.panic.map((p) => {
						if (p._id === action.payload.id) {
							p.tone = null;
						}
						return p;
					}),
				},
			};
		case 'REMOVE_PANIC':
			return {
				...state,
				...state,
				alerts: {
					...state.alerts,
					panic: state.alerts.panic.filter(
						(p) => p._id !== action.payload,
					),
				},
			};
		case 'SET_ALERT_DATA':
			return {
				...state,
				data: {
					...state.data,
					[action.payload.type]: action.payload.data,
				},
			};
		case 'RESET_ALERT_DATA':
			return {
				...state,
				data: {},
			};
		case 'ADD_ALERT_DATA':
			return {
				...state,
				data: {
					...state.data,
					[action.payload.type]:
						state.data[action.payload.type] != null
							? action.payload.first
								? [
										action.payload.data,
										...state.data[action.payload.type],
								  ]
								: [
										...state.data[action.payload.type],
										action.payload.data,
								  ]
							: [action.payload.data],
				},
			};
		case 'UPDATE_ALERT_DATA':
			return {
				...state,
				data: {
					...state.data,
					[action.payload.type]:
						Object.prototype.toString.call(
							state.data[action.payload.type],
						) == '[object Array]'
							? state.data[action.payload.type].map((data) =>
									data._id === action.payload.id
										? { ...action.payload.data }
										: data,
							  )
							: (state.data[action.payload.type] = {
									...state.data[action.payload.type],
									[action.payload.id]: action.payload.data,
							  }),
				},
			};
		case 'REMOVE_ALERT_DATA':
			return {
				...state,
				data: {
					...state.data,
					[action.payload.type]:
						Object.prototype.toString.call(
							state.data[action.payload.type],
						) == '[object Array]'
							? state.data[action.payload.type].filter((data) =>
									Object.prototype.toString.call(
										state.data[action.payload.type],
									) == '[object Array]'
										? data._id !== action.payload.id
										: data !== action.payload.id,
							  )
							: (state.data[action.payload.type] = Object.keys(
									state.data[action.payload.type],
							  ).reduce((result, key) => {
									if (key != action.payload.id) {
										result[key] =
											state.data[action.payload.type][
												key
											];
									}
									return result;
							  }, {})),
				},
			};
		default:
			return state;
	}
};
