import React, { useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		background: theme.palette.secondary.main,
		borderTop: 0,
	},
	fakeLink: {},
}));

export default connect()((props) => {
	const classes = useStyles();

	return <div className={classes.wrapper}>
        <Alert variant="filled" severity="error">
            Your account has been de-activated. If you believe this is a mistake, please contact <a href='mailto:support@reactrp.com'>support@reactrp.com</a>.
        </Alert>
    </div>;
});
