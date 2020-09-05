import React, { useState } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import {
	makeStyles,
	TextField,
	Button,
	Paper,
	InputAdornment,
	CircularProgress,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';

import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import EmailIcon from '@material-ui/icons/Email';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import FingerprintIcon from '@material-ui/icons/Fingerprint';

const initErrors = {
	username: {
		invalid: false,
		message: '',
	},
	email: {
		invalid: false,
		message: '',
	},
	password: {
		invalid: false,
		message: '',
	},
	code: {
		invalid: false,
		message: '',
	},
};

const useStyles = makeStyles((theme) => ({
	wrapper: {
		background: theme.palette.secondary.light,
		padding: 10,
		border: '1px solid #e0e0e008',
		borderRadius: 0,
		position: 'relative',
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
	register: {
		textAlign: 'center',
		marginTop: 15,
	},
	loader: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		margin: 'auto',
	},
}));

export default connect()((props) => {
	const classes = useStyles();

	const [errors, setErrors] = useState(initErrors);
	const [submit, setSubmit] = useState(0);
	const [password, setPassword] = useState('');
	const [pVerify, setVerify] = useState('');

	const onPassChange = (e) => {
		setPassword(e.target.value);
	};

	const onPassVerifyChange = (e) => {
		setVerify(e.target.value);
	};

	const register = (e, formVals) => {
		e.preventDefault();

		setSubmit(1);

		axios.post(`${process.env.REACT_APP_SERVER_ADDRESS}auth/register`, {
			email: event.target.email.value,
			username: event.target.username.value,
			password: event.target.password.value,
			code: event.target.code.value,
		}).then((res) => {
			setErrors({ ...initErrors });
			setSubmit(2);
			return;
		}).catch((err) => {
			switch(err.response.data.code) {
				case 'A01':
					setSubmit(3);
					setErrors({
						...initErrors,
						email: {
							invalid: true,
							message: err.response.data.error,
						},
					});
					break;
				case 'A02':
					setSubmit(3);
					setErrors({
						...initErrors,
						username: {
							invalid: true,
							message: err.response.data.error,
						},
					});
					break;
				case 'A03':
					setSubmit(3);
					setErrors({
						...initErrors,
						code: {
							invalid: true,
							message: err.response.data.error,
						},
					});
					break;
				default:
					setSubmit(-1);
					break;
			}
		});
	};

	return (
		<Paper className={classes.wrapper}>
			{submit === 1 ? (
				<CircularProgress size={100} className={classes.loader} />
			) : null}
			{submit === -1 ? (
				<Alert variant="filled" severity="error">
					An Unkown Error Occured, Please Try Again. If This Persists,
					Please Contact React RP Staff.
				</Alert>
			) : submit === 2 ? (
				<Alert variant="filled" severity="success">
					Your account has been registererd, you will be receiving an
					email shortly to verify & activate your account.
				</Alert>
			) : null}
			<form onSubmit={register}>
				<TextField
					name="email"
					className={classes.input}
					required
					error={errors.email.invalid}
					type="email"
					disabled={submit === 1 || submit === 2}
					helperText={
						errors.email.invalid && errors.email.message !== ''
							? errors.email.message
							: null
					}
					InputProps={{
						placeholder: 'Email',
						startAdornment: (
							<InputAdornment position="start">
								<EmailIcon />
							</InputAdornment>
						),
					}}
				/>
				<TextField
					name="username"
					className={classes.input}
					required
					error={errors.username.invalid}
					disabled={submit === 1 || submit === 2}
					helperText={
						errors.username.invalid &&
						errors.username.message !== ''
							? errors.username.message
							: null
					}
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
					name="password"
					type="password"
					className={classes.input}
					value={password}
					onChange={onPassChange}
					disabled={submit === 1 || submit === 2}
					required
					error={
						(password !== pVerify && pVerify !== '') ||
						errors.password.invalid
					}
					helperText={
						(errors.password.invalid &&
						errors.password.message !== ''
							? errors.password.message
							: null) ||
						(password !== pVerify && pVerify !== ''
							? 'Passwords Must Match'
							: null)
					}
					InputProps={{
						placeholder: 'Password',
						startAdornment: (
							<InputAdornment position="start">
								<VpnKeyIcon />
							</InputAdornment>
						),
					}}
				/>
				<TextField
					name="password-verify"
					type="password"
					className={classes.input}
					value={pVerify}
					onChange={onPassVerifyChange}
					disabled={submit === 1 || submit === 2}
					required
					error={
						(password !== pVerify && pVerify !== '') ||
						errors.password.invalid
					}
					helperText={
						(errors.password.invalid &&
						errors.password.message !== ''
							? errors.password.message
							: null) ||
						(password !== pVerify && pVerify !== ''
							? 'Passwords Must Match'
							: null)
					}
					InputProps={{
						placeholder: 'Verify Password',
						startAdornment: (
							<InputAdornment position="start">
								<VpnKeyIcon />
							</InputAdornment>
						),
					}}
				/>
				<TextField
					name="code"
					required
					className={classes.input}
					error={errors.code.invalid}
					disabled={submit === 1 || submit === 2}
					helperText={
						errors.code.invalid && errors.code.message !== ''
							? errors.code.message
							: null
					}
					InputProps={{
						placeholder: 'Registration Code',
						startAdornment: (
							<InputAdornment position="start">
								<FingerprintIcon />
							</InputAdornment>
						),
					}}
				/>
				<Button
					type="submit"
					fullWidth
					className={classes.loginBtn}
					disabled={submit === 1 || submit === 2}
				>
					Register Account
				</Button>
			</form>
		</Paper>
	);
});
