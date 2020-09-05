import React, { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { makeStyles, CircularProgress } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import io from 'socket.io-client';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		background: theme.palette.secondary.main,
		borderTop: 0,
	},
	fakeLink: {
		color: theme.palette.primary.main,
		fontWeight: 'bold',
		'&:hover': {
			filter: 'brightness(1.2)',
			transition: 'filter ease-in 0.15s',
			cursor: 'pointer',
		},
	},
}));

export default connect()((props) => {
	const classes = useStyles();
	const history = useHistory();
	const token = useSelector((state) => state.user.token);

	if (token == null) {
		history.replace('/');
		return;
	}

	const [status, setStatus] = useState(null);
	const [loading, setLoading] = useState(false);
	const onClick = (event) => {
		setLoading(true);
        let socket = io(`${process.env.REACT_APP_SERVER_ADDRESS}user`, {
            query: `token=${token}`,
        });
		socket.emit('resendVerify');
		socket.on('resendVerifyFeedback', (res) => {
			setLoading(false);
			setStatus(res);
			socket.disconnect();
		});
	};

	return (
		<div className={classes.wrapper}>
			{loading ? (
				<CircularProgress size={100} />
			) : (
				<Alert variant="filled" severity="error">
					You have not yet verified your registered email, you must do
					so before being able to access this site. You can click{' '}
					<span className={classes.fakeLink} onClick={onClick}>
						here
					</span>{' '}
					to request another email verification. If you use an
					incorrect email, or no longer have access to the email used,
					please email{' '}
					<a href="mailto:supprt@reactrp.com">
						support@reactrp.com
					</a>
					.
				</Alert>
			)}
		</div>
	);
});
