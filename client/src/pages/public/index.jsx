import React from 'react';
import { connect, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
	wrapper: {},
}));

export default connect()((props) => {
	const classes = useStyles();
	const session = useSelector((state) => state.user.session);

	return (
		<div className={classes.wrapper}>
			xD
		</div>
	);
});
