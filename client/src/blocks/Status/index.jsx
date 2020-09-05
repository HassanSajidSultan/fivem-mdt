import React, { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { makeStyles, useTheme, Grid, ButtonGroup, Button, Paper, IconButton } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';

import Statuses from '../../Statuses';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		background: theme.palette.secondary.light,
		padding: 5,
		border: `1px solid ${theme.palette.border.main}`,
        borderRadius: 0,
        marginBottom: 10,
	},
	header: {
		fontSize: 20,
		fontWeight: 500,
		padding: '0 7px',
        color: theme.palette.text.main,
		textAlign: 'left',
		lineHeight: '48px',
	},
	innerbody: {
		padding: 10,
		maxHeight: 250,
		overflowY: 'auto',
		overflowX: 'hidden',
		'&::-webkit-scrollbar': {
			width: 3,
		},
		'&::-webkit-scrollbar-thumb': {
			background: theme.palette.primary.main,
		},
		'&::-webkit-scrollbar-thumb:hover': {
			background: theme.palette.primary.dark,
		},
		'&::-webkit-scrollbar-track': {
			background: 'transparent',
		},
	},
	button: {
		width: '-webkit-fill-available',
		padding: 5,
		fontSize: 12,
		color: theme.palette.warning.main,
		'&:hover': {
			backgroundColor: `${theme.palette.warning.main}14`,
			transition: 'background-color ease-in 0.15s',
		},
	},
	buttonUnk: {
		width: '-webkit-fill-available',
		padding: 5,
		fontSize: 12,
		color: theme.palette.primary.main,
		'&:hover': {
			backgroundColor: `${theme.palette.primary.main}14`,
			transition: 'background-color ease-in 0.15s',
		},
	},
	buttonNegative: {
		width: '-webkit-fill-available',
		padding: 5,
		fontSize: 12,
		color: theme.palette.error.main,
		'&:hover': {
			backgroundColor: `${theme.palette.error.main}14`,
			transition: 'background-color ease-in 0.15s',
		},
	},
	buttonPanic: {
		background: theme.palette.error.main,
		color: theme.palette.text.main,
		padding: 5,
		fontSize: 12,
		'&:hover': {
			backgroundColor: `${theme.palette.error.dark}`,
			transition: 'background-color ease-in 0.15s',
		},
	},
	buttonDPanic: {
		background: theme.palette.success.main,
		color: theme.palette.text.main,
		padding: 5,
		fontSize: 12,
		'&:hover': {
			backgroundColor: `${theme.palette.success.dark}`,
			transition: 'background-color ease-in 0.15s',
		},
	},
	buttonPositive: {
		width: '-webkit-fill-available',
		padding: 5,
		fontSize: 12,
		color: theme.palette.success.main,
		'&:hover': {
			backgroundColor: `${theme.palette.success.main}14`,
			transition: 'background-color ease-in 0.15s',
		},
	},
	btnGroup: {
		marginBottom: 5,
		'&:first-child': {
			marginTop: 10,
		},
		'&:last-child': {
			marginBottom: 0,
		},
	},
	statusWrapper: {
		textAlign: 'center',
		marginBottom: 10,
	},
	statusText: {
		padding: 10,
	},
	offline: {
		color: theme.palette.error.main,
		fontWeight: 'bold',
		fontSize: 18,
		textAlign: 'center',
	},
	iconBtn: {
		color: theme.palette.text.alt,
		'&:hover': {
			background: 'rgba(0,0,0,0.15)',
			transition: 'background ease-in 0.15s',
		}
	}
}));

export default connect()((props) => {
	const classes = useStyles();
	const theme = useTheme();

	const cData = useSelector((state) => state.user.character);
	const ingame = useSelector((state) => state.user.ingame);
	const units = useSelector((state) => state.alerts.data.online);
	const notifs = useSelector((state) => state.job.notifications);
	const panics = useSelector((state) => state.alerts.alerts.panic);
	const alertsSocket = useSelector((state) => state.io.sockets.alerts);

    const [cd, setCd] = useState(false);

	const [myStatus, setMyStatus] = useState(Statuses.filter((s) => s.value === 'offline')[0]);
	useEffect(() => {
		if (cData != null && units != null && units[cData.Job.job] != null && units[cData.Job.job].length > 0) {
			let filter = units[cData.Job.job].filter((u) => u._id === cData._id);
			if (filter.length > 0) {
				setMyStatus(Statuses.filter((s) => s.value === filter[0].Status)[0]);
			} else {
				setMyStatus(Statuses.filter((s) => s.value === 'offline')[0]);
			}
		} else {
			setMyStatus(Statuses.filter((s) => s.value === 'offline')[0]);
		}
	}, [units, cData]);

	const panic = () => {
        setCd(true);
		alertsSocket.io.emit('panic');
	};

	const disablePanic = () => {
        let t = setTimeout(() => {
            setCd(false);
        }, 2000);
		alertsSocket.io.emit('clearPanic');
	};

	const updateStatus = (status) => {
		if (status !== myStatus.value) {
			alertsSocket.io.emit('updateStatus', status);
		}
	};

	if (cData == null) return null;

	return (
		<Paper className={classes.wrapper}>
			<Grid container className={classes.header}>
				<Grid item xs={12}>
					My Status
				</Grid>
			</Grid>
			<div className={classes.innerbody}>
				<ButtonGroup className={classes.btnGroup} orientation="vertical" fullWidth variant="contained">
					{panics.filter((p) => p._id === cData._id).length === 0 ? (
						<Button className={classes.buttonPanic} onClick={panic} disabled={!ingame || cd}>
							PANIC
						</Button>
					) : (
						<Button className={classes.buttonDPanic} onClick={disablePanic} disabled={!ingame}>
							DISABLE PANIC
						</Button>
					)}
				</ButtonGroup>

				<Grid container className={classes.statusWrapper}>
					<Grid item xs={12} className={classes.statusText}>
						Current Status:{' '}
						{!ingame ? <span>Not In Game</span> : <span style={myStatus.style}>{myStatus.label}</span>}
					</Grid>
					<Grid item xs={12}>
						<ButtonGroup className={classes.btnGroup} fullWidth>
							<Button
								className={classes.buttonNegative}
								onClick={() => updateStatus('unavailable')}
								disabled={!ingame || myStatus.value === 'offline'}
							>
								Not Available
							</Button>
							<Button
								className={classes.buttonPositive}
								onClick={() => updateStatus('available')}
								disabled={!ingame || myStatus.value === 'offline'}
							>
								Available
							</Button>
							<Button
								className={classes.button}
								onClick={() => updateStatus('oncall')}
								disabled={!ingame || myStatus.value === 'offline'}
							>
								On Call
							</Button>
						</ButtonGroup>
						<ButtonGroup className={classes.btnGroup} fullWidth>
							<Button className={classes.buttonUnk} disabled>
								Other <ExpandMore />
							</Button>
						</ButtonGroup>
					</Grid>
				</Grid>
			</div>
		</Paper>
	);
});
