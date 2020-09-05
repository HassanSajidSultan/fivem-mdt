import React from 'react';
import { connect, useSelector } from 'react-redux';
import { makeStyles, Grid, IconButton, Paper } from '@material-ui/core';
import { Link } from 'react-router-dom';

import Bolo from './Bolo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		background: theme.palette.secondary.light,
		padding: 5,
		border: `1px solid ${theme.palette.border.main}`,
		borderRadius: 0,
	},
	header: {
		fontSize: 20,
		fontWeight: 500,
		padding: '0 7px',
		color: theme.palette.text.main,
		textAlign: 'left',
		lineHeight: '48px',
	},
	body: {
		padding: 10,
	},
	none: {
		width: '100%',
		textAlign: 'center',
		fontSize: 25,
		fontWeight: 'bold',
	},
	moreBolos: {
		textAlign: 'center',
		background: theme.palette.secondary.dark,
		border: '1px solid #e0e0e008',
		fontSize: 20,
		fontWeight: 400,
		margin: '0 8px 8px 8px',
		'&:hover': {
			border: `1px solid ${theme.palette.text.alt}5e`,
			transition: 'border ease-in 0.15s',
			cursor: 'pointer',
		},
	},
	moreCount: {
		color: theme.palette.primary.main,
		fontWeight: 'bold',
	},
	innerMoreWrap: {
		display: 'block',
		padding: 5,
		color: theme.palette.text.main,
		textDecoration: 'none',
	},
	iconBtn: {
		color: theme.palette.text.alt,
		'&:hover': {
			background: 'rgba(0,0,0,0.15)',
			transition: 'background ease-in 0.15s',
		},
	},
}));

export default connect()((props) => {
	const classes = useStyles();
	const data = useSelector((state) => state.alerts.data);

	return (
		<Paper className={classes.wrapper}>
			<Grid container className={classes.header}>
				<Grid item xs={8}>
					Active BOLO's
				</Grid>
				<Grid item xs={4} style={{ textAlign: 'right' }}>
					<IconButton className={classes.iconBtn} component={Link} to="/create/bolo">
						<FontAwesomeIcon icon={['fal', 'plus']} />
					</IconButton>
				</Grid>
			</Grid>
			<div className={classes.body}>
				<Grid container spacing={2}>
					{data.bolo != null && data.bolo.filter((b) => b.active).length > 0 ? (
						data.bolo
							.filter((b) => b.active)
							.sort((a, b) => b.time - a.time)
							.filter((b, i) => i < 3)
							.map((bolo, i) => {
								return <Bolo key={`bolo-${i}`} bolo={bolo} />;
							})
					) : (
						<Grid item xs={12} className={classes.none}>
							{data.bolo != null ? "No Active BOLO's" : null}
						</Grid>
					)}
					{data.bolo != null && data.bolo.filter((b) => b.active).length > 3 ? (
						<Grid item xs={12} className={classes.moreBolos}>
							<Link className={classes.innerMoreWrap} to="/bolos">
								+<span className={classes.moreCount}>{data.bolo.filter((b) => b.active).length - 3}</span> Other Active BOLO's
							</Link>
						</Grid>
					) : null}
				</Grid>
			</div>
		</Paper>
	);
});
