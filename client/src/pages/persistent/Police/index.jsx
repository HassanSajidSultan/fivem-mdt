import React from 'react';
import { connect, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({}));

export default connect()((props) => {
	const classes = useStyles();
	const cData = useSelector((state) => state.user.character);
	const panics = useSelector((state) => state.job.alerts.panic);

	return <div></div>;
});
