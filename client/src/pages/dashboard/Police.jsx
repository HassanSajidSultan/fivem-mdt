import React from 'react';
import { connect } from 'react-redux';
import { makeStyles, Grid, Paper } from '@material-ui/core';
import { OfficerStatus, Bolo, Warrant } from './jobs/Police';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		background: theme.palette.secondary.light,
		border: `2px solid ${theme.palette.border.main}`,
		borderTop: 0,
		borderRadius: 0,
		height: 'fit-content',
		margin: 'auto',
		width: '100%',
		padding: 22,
	},
}));

export default connect()((props) => {
	const classes = useStyles();

	return (
		<Grid container spacing={3}>
			<Grid item xs={12}>
				<Bolo />
			</Grid>
			<Grid item xs={12} md={6} lg={4}>
				<Warrant />
			</Grid>
		</Grid>
	);
});
