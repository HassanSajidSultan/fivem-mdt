import React from 'react';
import { connect, useSelector } from 'react-redux';
import { makeStyles, Grid, IconButton, Paper } from '@material-ui/core';
import { Add } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		background: theme.palette.secondary.light,
		padding: 5,
		border: `1px solid ${theme.palette.border.main}`,
		borderRadius: 0,
	},
	header: {
		fontSize: 14,
		fontWeight: 500,
		textTransform: 'uppercase',
		fontFamily: 'ReactRP',
		padding: '0 14px',
		background: theme.palette.primary.main,
		color: theme.palette.text.dark,
		borderRadius: 0,
		border: `2px solid ${theme.palette.primary.light}`,
		textAlign: 'left',
		lineHeight: '46px',
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
}));

export default connect()((props) => {
	const classes = useStyles();
	const data = useSelector((state) => state.job.data);

	return (
		<Paper className={classes.wrapper}>
			<Grid container className={classes.header}>
				<Grid item xs={10}>
					Active Warrants
				</Grid>
				<Grid item xs={2} style={{ textAlign: 'right' }}>
					<IconButton>
						<Add />
					</IconButton>
				</Grid>
			</Grid>
			<div className={classes.body}>
				{data.warrants != null && data.warrants.length > 0 ? (
					data.warrants.map((warrant) => {
						return <div></div>;
					})
				) : (
					<div className={classes.none}>No Active Warrants</div>
				)}
			</div>
		</Paper>
	);
});
