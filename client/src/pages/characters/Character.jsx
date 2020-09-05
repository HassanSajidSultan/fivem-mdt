import React, { useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { makeStyles, Grid, Avatar } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import io from 'socket.io-client';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		height: 150,
		border: '1px solid #e0e0e008',
		background: theme.palette.secondary.light,
		overflow: 'hidden',
		'&:hover': {
			filter: 'brightness(1.2)',
			transition: 'filter ease-in 0.15s',
			cursor: 'pointer',
		},
	},
	avatar: {
		height: 100,
		width: 100,
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		margin: 'auto',
		fontSize: 55,
		background: theme.palette.secondary.dark,
		color: theme.palette.text.main,
		'& svg': {
			fontSize: 55,
		}
	},
	dataWrapper: {
		height: 'fit-content',
		width: 'fit-content',
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: '2%',
		margin: 'auto',
	},
	name: {
		fontSize: 22,
		color: theme.palette.primary.light,
	},
	job: {
		fontSize: 16,
		color: theme.palette.text.main,
	},
	active: {
		marginRight: 10,
		display: 'inline-block',
		fontSize: 16,
		color: theme.palette.success.main,
		lineHeight: '31px',
	},
	callsign: {
		marginLeft: 10,
		fontWeight: 'bold',
		color: theme.palette.alt.green,
	},
}));

export default connect()((props) => {
	const classes = useStyles();
	const history = useHistory();
	const userSocket = useSelector((state) => state.io.sockets.user);

	const [selected, setSelected] = useState(false);
	const onClick = (event) => {
		if (selected || userSocket == null) return;
		setSelected(true);

		userSocket.io.emit('setCharacter', props.character);
	};

	return (
		<Grid container className={classes.wrapper} onClick={onClick}>
			<Grid item xs={1} style={{ position: 'relative' }}>
				{props.character.Avatar != null ? (
					<Avatar
						className={classes.avatar}
						src={props.character.Avatar}
						alt={props.character.First.charAt(0)}
					/>
				) : (
					<Avatar className={classes.avatar}>
						<FontAwesomeIcon icon={['fad', 'user-alt']} />
					</Avatar>
				)}
			</Grid>
			<Grid item xs={11} style={{ textAlign: 'left', position: 'relative' }}>
				<div className={classes.dataWrapper}>
					<div className={classes.name}>
						{props.character.InGame ? <div className={classes.active}>In Game</div> : null}{' '}
						{props.character.First} {props.character.Last}
						{props.character.Job.callsign != null ? (
							<span className={classes.callsign}>
								{props.character.Job.callsign.sign} {props.character.Job.callsign.identifier}
							</span>
						) : null}
					</div>
					<div className={classes.job}>
						{props.character.Job.workplace.label} - {props.character.Job.grade.label}
					</div>
				</div>
			</Grid>
		</Grid>
	);
});
