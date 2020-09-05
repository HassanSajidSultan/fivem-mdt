import React, { useState, useMemo, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import {
	makeStyles,
    Paper,
    Grid,
    Avatar,
} from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
	wrapper: {
        background: theme.palette.secondary.light,
        border: `2px solid ${theme.palette.secondary.light}`,
        padding: 10,
        marginBottom: 10,
        '&:hover': {
            border: `2px solid ${theme.palette.alt.green}`,
            transition: 'border ease-in 0.15s',
            cursor: 'pointer',
        }
    },
    avatar: {
        background: theme.palette.primary.main,
        border: `2px solid ${theme.palette.primary.main}`,
        height: 50,
        width: 50,
        display: 'inline-flex',
        margin: 'auto',
    },
    text: {
        fontSize: 20,
        display: 'inline',
        marginLeft: 15,
    }
}));

export default connect()((props) => {
	const history = useHistory();
    const classes = useStyles();
    
    const onClick = () => {
        console.log(props.character._id);
    }

	return (
		<Paper className={classes.wrapper} onClick={onClick}>
            <Avatar className={classes.avatar}>C</Avatar>
            <div className={classes.text}>
                {props.character.First} {props.character.Last}
            </div>
		</Paper>
	);
});
