export const initialState = {
	data: {},
	notifications:
		localStorage.getItem('jobNotifs') != null
			? localStorage.getItem('jobNotifs')
			: true,
	alerts: {}
};

export default (state = initialState, action) => {
	switch (action.type) {
		case 'TOGGLE_JOB_NOTIFICATIONS': {
			localStorage.setItem('jobNotifs', !state.notifications);
			return {
				...state,
				notifications: !state.notifications,
			};
		}
		case 'SET_JOB_DATA':
			return {
				...state,
				data: {
					...state.data,
					[action.payload.type]: action.payload.data,
				},
			};
		case 'RESET_JOB_DATA':
			return {
				...state,
				data: {},
			};
		case 'ADD_JOB_DATA':
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
		case 'UPDATE_JOB_DATA':
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
		case 'REMOVE_JOB_DATA':
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
