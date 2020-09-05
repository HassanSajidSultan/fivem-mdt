import React, { useState } from 'react';
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
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';

import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import EmailIcon from '@material-ui/icons/Email';

const useStyles = makeStyles((theme) => ({
	formWrapper: {
		background: theme.palette.secondary.light,
		padding: 10,
		border: '1px solid #e0e0e008',
		borderRadius: 0,
		position: 'relative',
	},
	inner: {
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
	header: {
		padding: 10,
		textAlign: 'center',
		color: theme.palette.text.main,
		fontSize: '0.9375rem',
		fontWeight: 400,
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
}));

export default connect()((props) => {
	const classes = useStyles();
	const history = useHistory();

	const onSubmit = (event) => {
		event.preventDefault();
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
						<Grid item xs={12} md={4} lg={6} style={{textAlign: 'center'}}>
							<h3>
								Welcome to the Los Santos Electronic Criminal Records Management System
							</h3>
							<p style={{textAlign: 'left'}}>Access to this data is heavily restricted & monitored. Any attempt to abuse this system in any manor not intended or by unauthorized parties will be met with the harshest possible punishments.</p>
							<p style={{textAlign: 'left'}}>By using this system, it is assumed you understand & agree to all terms of use associated with this system and are responsible for any actions you, or performed by your registered account, perform.</p>
						</Grid>
						<Grid item xs={6}>
							<Paper className={classes.form}>
								<div className={classes.header}>
									Account Recovery
								</div>
								<Alert variant="filled" severity="error">
									THIS FORM IS NOT YET IMPLEMENTED, IT WILL NOT SEND YOU ANYTHING
								</Alert>
								<Grid item xs={12}>
									<Paper className={classes.formWrapper}>
										<form onSubmit={onSubmit}>
											<TextField
												className={classes.input}
												type="email"
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
												className={classes.input}
												InputProps={{
													placeholder: 'Username',
													startAdornment: (
														<InputAdornment position="start">
															<AccountCircleIcon />
														</InputAdornment>
													),
												}}
											/>
											<div className={classes.buttons}>
												<Button
													type="submit"
													className={classes.cancelBtn}
													onClick={() => history.goBack()}
												>
													Cancel
												</Button>
												<Button
													type="submit"
													className={classes.loginBtn}
												>
													Recover Account
												</Button>
											</div>
										</form>
									</Paper>
								</Grid>
							</Paper>
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		</div>
	);
});
