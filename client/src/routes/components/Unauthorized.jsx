import React from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
    errorCode: {
        fontSize: 55,
        color: theme.palette.error.main,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    errorMsg: {
        fontSize: 25,
        textAlign: 'center',
        marginTop: 25,
    }
}));

export default connect()((props) => {
	const classes = useStyles();

	return <div className={classes.wrapper}>
		<div className={classes.errorCode}>
			404
		</div>
		<div className={classes.errorMsg}>
			You don't have permission to view this page
		</div>
    </div>;
});
