import React, { useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { makeStyles, Grid } from '@material-ui/core';

import OnlineUser from './OnlineUser';

const useStyles = makeStyles((theme) => ({
	rank: {
		fontSize: 14,
		float: 'right',
		lineHeight: '20px',
		marginRight: 5,
	},
	me: {
		padding: '10px 5px',
		background: theme.palette.secondary.light,
		color: theme.palette.alt.green,
		marginBottom: 2,
		position: 'relative',
		'&:last-child': {
			marginBottom: 0,
		},
	},
	normal: {
		padding: '10px 5px',
		background: theme.palette.secondary.light,
		marginBottom: 2,
		position: 'relative',
		'&:last-child': {
			marginBottom: 0,
		},
	},
	paniced: {
		'-webkit-animation': 'panic 1s infinite',
		padding: '10px 5px',
		marginBottom: 2,
		position: 'relative',
	},
	jobTitle: {
		fontSize: 16,
		color: theme.palette.text.alt,
	},
	none: {
		color: theme.palette.error.main,
	},
	userList: {
		width: '100%',
	},
	dutyCount: {
		color: theme.palette.primary.main,
	},
}));

export default connect()((props) => {
	const classes = useStyles();
	const session = useSelector((state) => state.user.session);
	const cData = useSelector((state) => state.user.character);
	const ingame = useSelector((state) => state.user.ingame);
	const panics = useSelector((state) => state.alerts.alerts.panic);

	if (props.list.length > 0) {
		return (
			<Grid container className={classes.wrapper}>
				<Grid item xs={12}>
					<span className={classes.jobTitle}>
						{props.title}
						{props.list.filter((l) => l.Status !== 'offline').length > 0 ? (
							<span>
								-{' '}
								<span className={classes.dutyCount}>
									{props.list.filter((l) => l.Status !== 'offline').length} On Duty
								</span>
							</span>
						) : null}
					</span>
				</Grid>
				<div className={classes.userList}>
					{props.list
						.filter((a) => {
							return panics.filter((p) => p._id === a._id).length > 0;
						})
						.map((char) => {
							return (
								<OnlineUser
									key={`${props.index}-${char._id}-normal`}
									character={char}
									status={null}
									paniced
								/>
							);
						})}
					{cData != null &&
					ingame &&
					session.job === props.index &&
					panics.filter((p) => p._id === cData._id).length === 0 ? (
						<OnlineUser key={`${props.index}-${cData._id}-me`} character={cData} status={props.myStatus} />
					) : null}
					{props.list
						.filter((a) => {
							return (
								panics.filter((p) => p._id === a._id).length === 0 &&
								cData != null &&
								a._id !== cData._id
							);
						})
						.map((char) => {
							let status = props.statuses.filter((s) => s.value === char.Status)[0];
							return (
								<OnlineUser
									key={`${props.index}-${char._id}-normal`}
									character={char}
									status={status}
								/>
							);
						})}
				</div>
			</Grid>
		);
	} else {
		return (
			<Grid container>
				<Grid item xs={12}>
					<span className={classes.jobTitle}>{props.title}</span>
				</Grid>
				<Grid item xs={12} className={classes.normal}>
					<span className={classes.none}>No {props.title} On-Duty</span>
				</Grid>
			</Grid>
		);
	}
});
