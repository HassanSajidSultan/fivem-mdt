import React, { useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { Router, Switch } from 'react-router';
import { createBrowserHistory } from 'history';
import { ToastContainer } from 'react-toastify';
import { makeStyles, Grid, CircularProgress } from '@material-ui/core';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Sockets from './sockets';
import Persistent from './pages/persistent';
import Footer from './components/Footer';

import MyRoutes from './routes/MyRoutes';

import Online from './blocks/Online';
import Status from './blocks/Status';

export const customHistory = createBrowserHistory();

const useStyles = makeStyles((theme) => ({
	wrapper: {
		minHeight: '100vh',
		height: '100%',
		background: theme.palette.secondary.dark,
	},
	body: {
		width: '99%',
		[theme.breakpoints.up('lg')]: {
			width: '84%',
		},
		display: 'inline-flex',
		margin: '0.5% 0.5% 0 0.5%',
		maxHeight: 'calc(100vh - 86px)',
		overflow: 'auto',
		'&::-webkit-scrollbar': {
			width: 0,
		},
	},
	content: {
		[theme.breakpoints.up('md')]: {
			height: 'calc(100vh - 86px)',
			overflow: 'auto',	
			'&::-webkit-scrollbar': {
				width: 0,
			},
		},
	},
	loading: {
		textAlign: 'center',
		fontSize: 30,
	}
}));

export default connect()((props) => {
	const classes = useStyles();
	const token = useSelector((state) => state.user.token);
	const session = useSelector((state) => state.user.session);
	const sessionLoaded = useSelector((state) => state.user.sessionLoaded);
	const cData = useSelector((state) => state.user.character);

	const [showSidebar, setShowSidebar] = useState(false);
	useEffect(() => {
		setShowSidebar(token != null && session != null && cData != null && session.sid && session.verified && session.active && session.job === cData.Job.job);
	}, [token, session, cData])

	return (
		<Router history={customHistory}>
			<Persistent />
			<Sockets />
			<div className={classes.wrapper}>
				<Navbar />
				<Grid container spacing={2} className={classes.body}>
					<Grid
						item
						xs={12}
						md={showSidebar ? 8 : 12}
						lg={showSidebar ? 9 : 12}
						className={classes.content}
					>
						{
							token && !sessionLoaded ? (
								<div className={classes.loading}>
									<CircularProgress size={100} />
									<div>
										Loading Content
									</div>
								</div>
							) : (
								<MyRoutes />
							)
						}
					</Grid>
					{showSidebar ? (
						<Grid item xs={12} md={4} lg={3}>
							<Status />
							<Online />
							<Footer />
						</Grid>
					) : 
						<Grid item xs={12}>
							<Footer />
						</Grid>}
				</Grid>
			</div>
			<ToastContainer
				position="top-right"
				autoClose={5000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss={false}
				draggable
				pauseOnHover
			/>
		</Router>
	);
});
