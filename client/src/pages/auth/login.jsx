import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Alert } from '@material-ui/lab';
import {
	makeStyles,
	Grid,
	TextField,
	Button,
	FormControlLabel,
	Checkbox,
	Paper,
	InputAdornment,
} from '@material-ui/core';

import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import VpnKeyIcon from '@material-ui/icons/VpnKey';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		background: theme.palette.secondary.light,
		padding: 10,
		border: '1px solid #e0e0e008',
		borderRadius: 0,
	},
	input: {
		width: '100%',
		marginTop: 25,
	},
	loginBtn: {
		background: theme.palette.success.main,
		textTransform: 'none',
		marginTop: 15,
		'&:hover': {
			background: theme.palette.success.main,
			filter: 'brightness(1.1)',
			transition: 'filter ease-in 0.15s',
		},
	},
	forgot: {
		fontSize: 12,
		fontWeight: 400,
		lineHeight: '42px',
		color: theme.palette.text.main,
		marginRight: -16,
		'&:hover': {
			color: theme.palette.primary.main,
			transition: 'color ease-in 0.15s',
		},
	},
}));

export default connect()((props) => {
	const classes = useStyles();

	const [error, setError] = useState(null);

	const login = (event) => {
		event.preventDefault();

		axios.post(`${process.env.REACT_APP_SERVER_ADDRESS}auth/login`, {
			username: event.target.username.value,
			password: event.target.password.value,
			remember: event.target.remember.checked,
		}).then((res) => {
			props.dispatch({
				type: 'LOGIN',
				payload: {
					token: res.data.token,
					account: res.data.account
				}
			});
		}).catch((err) => {
			setError(err.request.data);
		});
	};

	return (
		<Paper className={classes.wrapper}>
			{
				error != null ? (
					!error.valid ? (
						<Alert variant="filled" severity="error">
							Invalid Login Credentials
						</Alert>
					) : (
						!error.verified ?
							<Alert variant="filled" severity="error">
								Your Registered Email Has Not Been Verified, Click <span className={classes.fakelink}>Here</span> To Resend A Verification Email.
							</Alert> : 
							<Alert variant="filled" severity="error">
								Your Account Has Been De-activated, If You Believe This Is A Mistake Please Contact React RP Staff.
							</Alert>
					)
				) : null
			}
			<form onSubmit={login}>
				<TextField
					className={classes.input}
					name="username"
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
					type="password"
					name="password"
					className={classes.input}
					InputProps={{
						placeholder: 'Password',
						startAdornment: (
							<InputAdornment position="start">
								<VpnKeyIcon />
							</InputAdornment>
						),
					}}
				/>
				<Grid container style={{ marginTop: 15 }}>
					<Grid item xs={6}>
						<FormControlLabel
							control={
								<Checkbox name="remember" color="primary" />
							}
							label="Remember Me"
						/>
					</Grid>
					<Grid item xs={6} style={{ textAlign: 'right' }}>
						<FormControlLabel
							control={
								<Link to="/recover" className={classes.forgot}>
									Forgot Your Password?
								</Link>
							}
						/>
					</Grid>
				</Grid>
				<Button fullWidth className={classes.loginBtn} type="submit">
					Sign In
				</Button>
			</form>
		</Paper>
	);
});
