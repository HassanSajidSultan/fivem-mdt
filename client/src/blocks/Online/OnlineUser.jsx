import React, { useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { makeStyles, Avatar, Grid } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default connect()((props) => {
	const useStyles = makeStyles((theme) => ({
		wrapper: {
			padding: 10,
			width: '100%',
			marginBottom: 2,
			borderRadius: 0,
			position: 'relative',
			'&:hover': {
				background: theme.palette.secondary.dark,
				transition: 'background ease-in 0.15s',
				cursor: 'pointer',
			},
			'&:last-child': {
				marginBottom: 0,
			},
		},
		wrapperPanic: {
			padding: 10,
			width: '100%',
			marginBottom: 2,
			borderRadius: 0,
			position: 'relative',
			'-webkit-animation': 'panic 1s infinite',
			'&:hover': {
				background: theme.palette.secondary.dark,
				transition: 'background ease-in 0.15s',
				cursor: 'pointer',
			},
			'&:last-child': {
				marginBottom: 0,
			},
		},
		mainName: {
			fontSize: 16,
			fontWeight: 'bold',
		},
		minorName: {
			fontSize: 12,
			marginLeft: 5,
			fontWeight: 'regular',
			color: !props.paniced ? theme.palette.text.alt : 'inherit',
		},
		statusWrapper: {
			marginLeft: 5,
		},
		title: {
			color: !props.paniced ? theme.palette.text.main : 'inherit',
		},
		jobDetails: {
			fontSize: 11,
			color: theme.palette.text.main,
		},
		avatar: {
			position: 'absolute',
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
			margin: 'auto',
		},
	}));

	const classes = useStyles();

	return (
		<Grid container className={props.paniced ? classes.wrapperPanic : classes.wrapper}>
			<Grid item xs={3} sm={2} style={{ position: 'relative' }}>
				{props.character.Avatar != null ? (
					<Avatar
						className={classes.avatar}
						src={props.character.Avatar}
						alt={
							props.character.Job.callsign != null
								? `${props.character.Job.callsign.sign.charAt(0)} ${props.character.Job.callsign.identifier}`
								: props.character.First.charAt(0)
						}
					/>
				) : (
					<Avatar className={classes.avatar}>
						{props.character.Job.callsign != null
							? `${props.character.Job.callsign.sign.charAt(0)} ${props.character.Job.callsign.identifier}`
							: props.character.First.charAt(0)}
					</Avatar>
				)}
			</Grid>
			<Grid item xs={9} sm={10}>
				{props.character.Job.callsign != null ? (
					<span className={classes.mainName}>
						{props.character.Job.callsign.sign} {props.character.Job.callsign.identifier}
						<span className={classes.minorName}>
							( <span className={classes.title}>{props.character.Job.grade.label}</span>{' '}
							{props.character.First.charAt(0)} {props.character.Last} )
						</span>
					</span>
				) : (
					<span className={classes.mainName}>
						<span className={classes.title}>{props.character.Job.grade.label}</span> {props.character.First}{' '}
						{props.character.Last}
					</span>
				)}
				{props.paniced ? (
					<span className={classes.statusWrapper}>
						- <span>IN DISTRESS</span>
					</span>
				) : (
					<span className={classes.statusWrapper}>
						- <span style={props.status.style}>{props.status.label}</span>
					</span>
				)}
				<div className={classes.jobDetails}>{props.character.Job.workplace.label}</div>
			</Grid>
		</Grid>
	);
});
