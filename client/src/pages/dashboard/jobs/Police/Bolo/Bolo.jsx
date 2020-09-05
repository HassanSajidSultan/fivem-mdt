import React from 'react';
import { connect, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { makeStyles, Grid } from '@material-ui/core';

import DriveEtaIcon from '@material-ui/icons/DriveEta';
import AccessibilityNewIcon from '@material-ui/icons/AccessibilityNew';
import Moment from 'react-moment';

import BoloTypes from '../../../../../BoloTypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const useStyles = makeStyles((theme) => ({
	boloWrap: {
		padding: 20,
		background: theme.palette.secondary.dark,
		border: '1px solid #e0e0e008',
		textAlign: 'center',
		position: 'relative',
		'&:hover': {
			border: `1px solid ${theme.palette.text.alt}5e`,
			//border: `1px solid ${theme.palette.alt.green}`,
			transition: 'border ease-in 0.15s',
			cursor: 'pointer',
		},
	},
	boloIcon: {
		position: 'absolute',
		top: '10%',
		left: '2%',
		color: theme.palette.text.main,
		fontSize: 20,
	},
	details: {
		width: '90%',
		margin: 'auto',
	},
	title: {
		fontSize: 18,
		fontWeight: 'bold',
		color: theme.palette.text.main,
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
		marginBottom: 10,
	},
	description: {
		color: theme.palette.text.alt,
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
	},
	button: {
		width: '-webkit-fill-available',
		padding: 5,
		color: theme.palette.warning.main,
		'&:hover': {
			backgroundColor: `${theme.palette.warning.main}14`,
		},
	},
	buttonNegative: {
		width: '-webkit-fill-available',
		padding: 5,
		color: theme.palette.error.main,
		'&:hover': {
			backgroundColor: `${theme.palette.error.main}14`,
		},
	},
	buttonPositive: {
		width: '-webkit-fill-available',
		padding: 5,
		color: theme.palette.success.main,
		'&:hover': {
			backgroundColor: `${theme.palette.success.main}14`,
		},
	},
	boloFooter: {
		borderTop: `1px solid ${theme.palette.border.divider}`,
		marginTop: 20,
		paddingTop: 10,
		fontSize: 10,
		color: theme.palette.text.alt,
	},
	boloTime: {
		float: 'right',
	},
	status: {
		float: 'left',
	},
	active: {
		color: theme.palette.success.main,
	},
	inactive: {
		color: theme.palette.error.main,
	},
}));

export default connect()((props) => {
	const classes = useStyles();
	const history = useHistory();

	const type = BoloTypes.filter(b => b.value === props.bolo.type)[0];

	const onClick = () => {
		history.push(`/bolos/${props.bolo._id}`);
	};

	return (
		<Grid item xs={12} md={6} lg={4} onClick={onClick}>
			<div className={classes.boloWrap}>
				<FontAwesomeIcon icon={['fad', type.icon]} className={classes.boloIcon} title={`${type.label} BOLO`} />
				<div className={classes.details}>
					<div className={classes.title}>{props.bolo.title}</div>
					<div className={classes.description}>{props.bolo.description}</div>
				</div>
				<div className={classes.boloFooter}>
					<div className={classes.status}>
						{props.bolo.active ? (
							<span className={classes.active}>Active</span>
						) : (
							<span className={classes.inactive}>Inctive</span>
						)}
					</div>
					<Moment className={classes.boloTime} date={props.bolo.time} format="dddd, MMMM Do YYYY" />
				</div>
			</div>
		</Grid>
	);
});
