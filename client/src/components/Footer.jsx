import React, { useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { makeStyles, Paper, Grid } from '@material-ui/core';

import logo from '../assets/img/logo_sm.png';

const useStyles = makeStyles((theme) => ({
	footer: {
		flexGrow: 1,
        background: 'transparent',
		width: '100%',
    },
    inner: {
        padding: '0 10px',
		borderRadius: 0,
		margin: '0 auto',
		position: 'relative',
    },
    logoWrapper: {
        textAlign: 'left',
    },
    logo: {
        width: 50,
    },
    footerText: {
        textAlign: 'right',
        textTransform: 'uppercase',
        fontSize: 10,
        color: theme.palette.text.main,
        lineHeight: '55px',
    },
    branding: {

    },
    sepa: {
        display: 'inline-block',
        height: 18,
        width: 4,
        borderTopLeftRadius: 25,
        borderBottomRightRadius: 25,
        background: theme.palette.primary.main,
        opacity: 1,
        position: 'relative',
        marginLeft: 14,
        marginRight: 14,
        top: 6,
        transform: 'rotate(20deg)',
    },
    site: {
        color: theme.palette.text.main,
    }
}));

export default connect()((props) => {
	const classes = useStyles();

	return (
		<Paper className={classes.footer} elevation={0}>
            <Grid container className={classes.inner}>
                <Grid item xs={12} className={classes.footerText}>
                    <span className={classes.branding}>React Roleplay</span>
                    <span className={classes.sepa} />
                    <span className={classes.site}>www.reactrp.com</span>
                </Grid>
            </Grid>
		</Paper>
	);
});
