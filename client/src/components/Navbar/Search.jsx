import React, { useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { TextField } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink } from 'react-router-dom';
import { ExpandLess, ExpandMore } from '@material-ui/icons';

import MenuItem from './MenuItem';
import MenuItemExternal from './MenuItemExternal';

const useStyles = makeStyles((theme) => ({
	link: {
		color: theme.palette.text.main,
		height: 60,
		'& svg': {
			color: theme.palette.alt.green,
			transition: 'all ease 0.4s',
			fontSize: 30,
		},
		'&:hover': {
			color: `${theme.palette.primary.main}91`,
			transition: 'color ease-in 0.15s',
			cursor: 'pointer',
			'& svg': {
				color: `${theme.palette.primary.main}91`,
				transition: 'color ease-in 0.15s',
			},
		},
		'&.active': {
			color: theme.palette.primary.main,
			'& svg': {
				color: theme.palette.primary.main,
				'--fa-secondary-opacity': 1.0,
			},
		},
	},
}));

export default connect()((props) => {
	const classes = useStyles();
	const ingame = useSelector((state) => state.user.ingame);

	return (
        <TextField
            fullWidth
            variant="outlined"
            label="Search"
            style={{ margin: '0 0 0 25px' }}
        />
	);
});
