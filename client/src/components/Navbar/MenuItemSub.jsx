import React, { useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { List, ListItem, ListItemIcon, ListItemText, Collapse } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink } from 'react-router-dom';
import { ExpandLess, ExpandMore } from '@material-ui/icons';

import MenuItem from './MenuItem';
import MenuItemExternal from './MenuItemExternal';

const useStyles = makeStyles((theme) => ({
	link: {
		color: theme.palette.text.main,
		height: 60,
		transition: 'color ease-in 0.15s, background-color ease-in 0.15s',
		'& svg': {
			fontSize: 20,
			transition: 'color ease-in 0.15s',
		},
		'&:hover': {
			color: `${theme.palette.primary.main}`,
			cursor: 'pointer',
			'& svg': {
				color: `${theme.palette.primary.main}`,
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
		<>
			<ListItem
				className={classes.link}
				component={NavLink}
				exact={props.link.exact}
				to={props.link.path}
				name={props.link.name}
				onClick={props.onClick}
				button
			>
				<ListItemIcon>
					<FontAwesomeIcon icon={props.link.icon} />
				</ListItemIcon>
				<ListItemText primary={props.link.label} />
				{props.link.submenu ? props.open === props.link.name ? <ExpandLess /> : <ExpandMore /> : null}
			</ListItem>
			<Collapse in={props.open === props.link.name}>
				<List component="div" disablePadding>
					{props.link.items.map((sublink, j) => {
						if (sublink.external) {
							if (ingame) return;
							return (
								<MenuItemExternal key={`sub-${props.link.name}-${j}`} link={sublink} onClick={props.handleMenuClose} />
							);
						} else {
							return (
								<MenuItem key={`sub-${props.link.name}-${j}`} link={sublink} onClick={props.handleMenuClose} nested />
							);
						}
					})}
				</List>
			</Collapse>
		</>
	);
});
