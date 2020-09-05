import React, { useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import { makeStyles, Paper, CircularProgress } from '@material-ui/core';
import { toast } from 'react-toastify';
import queryString from 'query-string';
import io from 'socket.io-client';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		background: theme.palette.secondary.dark,
		borderTop: 0,
		textAlign: 'center',
		height: 500,
		padding: 20,
		position: 'relative',
	},
	container: {
		height: 'fit-content',
		width: 'fit-content',
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		margin: 'auto',
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
	const key = queryString.parse(props.location.search).key;

	useEffect(() => {
		if (key != null) {
			axios.post(`${process.env.REACT_APP_SERVER_ADDRESS}auth/verify`, {
				key: key,
			}).then((res) => {
				toast.success('Account Verified');
				history.replace('/login');
			}).catch((err) => {
				toast.error('Unable To Verify Account');
				history.replace('/');
			});
		} else {
			history.replace('/');
		}
	}, []);

	return (
		<Paper className={classes.wrapper}>
			<div className={classes.container}>
				<CircularProgress size={100} />
				<div className={classes.text}>Verifying Account</div>
			</div>
		</Paper>
	);
});
