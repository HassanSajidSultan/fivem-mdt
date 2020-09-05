import React from 'react';
import { connect, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { useMediaQuery, List } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';

import MenuItem from './MenuItem';
import MenuItemExternal from './MenuItemExternal';
import MenuItemSub from './MenuItemSub';

const useStyles = makeStyles((theme) => ({
	mainNav: {
		background: theme.palette.secondary.main,
		width: '15%',
		display: 'inline-block',
		verticalAlign: 'top',
		height: 'calc(100vh - 86px)',
		overflow: 'auto',
		'&::-webkit-scrollbar': {
			width: 0,
		},
	},
	menu: {
		background: theme.palette.secondary.dark,
		borderRadius: 0,
		zIndex: 100,
	},
}));

export default connect()((props) => {
	const classes = useStyles();
	const theme = useTheme();
	const isMobile = !useMediaQuery(theme.breakpoints.up('lg'));
	const ingame = useSelector((state) => state.user.ingame);

	return (
		<List className={!isMobile ? classes.mainNav : ''}>
			{props.links.map((link, i) => {
				if (link.external) {
					if (ingame) return;
					return (
						<div key={`${link.path}-${i}`}>
							<MenuItemExternal compress={props.compress} link={link} onClick={props.handleMenuClose} />
						</div>
					);
				} else {
					if (link.submenu) {
						return (
							<div key={`${link.path}-${i}`}>
								<MenuItemSub
									compress={props.compress}
									link={link}
									open={props.open}
									onClick={props.onClick}
									handleMenuClose={props.handleMenuClose}
								/>
							</div>
						);
					} else {
						return (
							<div key={`${link.path}-${i}`}>
								<MenuItem compress={props.compress} link={link} onClick={props.handleMenuClose} />
							</div>
						);
					}
				}
			})}
		</List>
	);
});
