import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { connect, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
	makeStyles,
	Grid,
	Paper,
	TextField,
	InputAdornment,
	Button,
	Backdrop,
	CircularProgress,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { toast } from 'react-toastify';
import io from 'socket.io-client';

import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import VpnKeyIcon from '@material-ui/icons/VpnKey';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		background: theme.palette.secondary.main,
		borderTop: 0,
	},
	inner: {
		background: theme.palette.secondary.dark,
		border: '1px solid #e0e0e008',
		borderRadius: 0,
		height: 'fit-content',
		margin: 'auto',
		width: '100%',
	},
	innerinner: {
		background: theme.palette.secondary.light,
		border: '1px solid #e0e0e008',
		borderRadius: 0,
		height: 'fit-content',
	},
	form: {
		background: theme.palette.secondary.main,
		padding: 10,
		border: '1px solid #e0e0e008',
	},
	input: {
		width: '100%',
		margin: '10px 0',
	},
	buttons: {
		display: 'flex',
		justifyContent: 'space-around',
	},
	cancelBtn: {
		display: 'inline-flex',
		width: '49%',
		background: theme.palette.error.main,
		textTransform: 'none',
		'&:hover': {
			background: theme.palette.error.main,
			filter: 'brightness(1.1)',
			transition: 'filter ease-in 0.15s',
		},
	},
	loginBtn: {
		display: 'inline-flex',
		width: '49%',
		background: theme.palette.success.main,
		textTransform: 'none',
		'&:hover': {
			background: theme.palette.success.main,
			filter: 'brightness(1.1)',
			transition: 'filter ease-in 0.15s',
		},
	},
	public: {
		textAlign: 'center',
		fontSize: 16,
		fontWeight: 'bold',
		marginTop: 10,
		borderTop: `1px solid ${theme.palette.primary.main}`,
	},
	submitting: {
		zIndex: 1000
	},
	text: {
		color: theme.palette.text.main,
		fontSize: 25,
		marginTop: 20,
	},
}));

export default connect()((props) => {
	const classes = useStyles();
	const history = useHistory();
	const token = useSelector((state) => state.user.token);
	const session = useSelector((state) => state.user.session);

	const [submit, setSubmit] = useState(false);

	useEffect(() => {
		if (session.sid != null) {
			history.replace('/');
		}
	}, [session])

	const onSubmit = (event) => {
		event.preventDefault();
		setSubmit(true);
        let socket = io(`${process.env.REACT_APP_SERVER_ADDRESS}user`, {
            query: `token=${token}`,
            forceNew: true,
		});
		socket.emit('link', {
			username: event.target.username.value,
			password: event.target.password.value,
		});
		socket.on('linkFeedback', (res) => {
			if (res != null) {
				props.dispatch({
					type: 'LOGIN',
					payload: { token: res.token, user: res.user },
				});
				toast.success('Successfully Linked Account');
				history.replace('/characters');
			} else {
				toast.error('Unable To Link Account');
				setSubmit(false);
			}
			
			socket.disconnect();
		});
	};

	return (
		<div className={classes.wrapper}>
			<Grid container spacing={2} className={classes.inner}>
				<Grid item xs={12}>
					<Alert variant="filled" severity="info">
						Abuse of this system will result in permanent suspension
						from the React RP community.
					</Alert>
				</Grid>
				<Grid item xs={12}>
					<Grid
						container
						className={classes.innerinner}
						style={{ padding: 25 }}
					>
						<Grid item xs={6} style={{ textAlign: 'center' }}>
							<h3>
								Welcome to the React RP Electronic Records
								System
							</h3>
							<p>
								Accesses restricted systems without appropriate
								authorizations will result in extreme action by
								React RP administration.
							</p>
						</Grid>
						<Grid item xs={6}>
							<Paper className={classes.form}>
								<Grid item xs={12}>
									<Alert variant="filled" severity="warning">
										We need to link your account with your
										React RP forum account before you can
										get full access to our system. Please
										enter your forum username & password and
										we'll verify & link it to your
										Electronic Records System Account.
									</Alert>
								</Grid>
								<Grid
									item
									xs={12}
									style={{ position: 'relative' }}
								>
									<Backdrop
										className={classes.submitting}
										open={submit}
									>
										<CircularProgress size={100} />
										<div className={classes.text}>Checking Credentials</div>
									</Backdrop>
									<form onSubmit={onSubmit}>
										<TextField
											className={classes.input}
											name="username"
											disabled={submit}
											InputProps={{
												placeholder: 'Username',
												startAdornment: (
													<InputAdornment position="start">
														<AccountCircleIcon />
													</InputAdornment>
												),
											}}
										/>
										<TextField
											className={classes.input}
											type="password"
											name="password"
											disabled={submit}
											InputProps={{
												placeholder: 'Password',
												startAdornment: (
													<InputAdornment position="start">
														<VpnKeyIcon />
													</InputAdornment>
												),
											}}
										/>
										<div className={classes.buttons}>
											<Button
												type="submit"
												disabled={submit}
												className={classes.loginBtn}
											>
												Link Account
											</Button>
										</div>
									</form>
								</Grid>
							</Paper>
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		</div>
	);
});
