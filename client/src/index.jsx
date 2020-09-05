import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './App';
import configureStore from './configureStore';
const initialState = {};
const MOUNT_NODE = document.getElementById('root');

export const store = configureStore(initialState);

const render = () => {
	ReactDOM.render(
		<Provider store={store}>
			<App />
		</Provider>,
		MOUNT_NODE,
	);
};

if (module.hot) {
	module.hot.accept(['./App'], () => {
		ReactDOM.unmountComponentAtNode(MOUNT_NODE);
		render();
	});
}

render();
