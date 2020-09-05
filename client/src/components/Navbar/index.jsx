import React, { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { useMediaQuery, AppBar, Toolbar, IconButton, Drawer, Divider, TextField } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from '@material-ui/icons';

import UserMenu from '../UserMenu';
import NavLinksEl from './NavLinks';
import Search from './Search';
import cityLogo from '../../assets/img/city-logo.webp';

const NavLinks = {
	guest: [
		{
			name: 'public',
			icon: ['fad', 'home'],
			label: 'Public Records',
			path: '/',
		},
	],
	police: [
		{
			name: 'home',
			icon: ['fad', 'home'],
			label: 'Dashboard',
			path: '/',
			exact: true,
		},
		{
			name: 'search',
			icon: ['fad', 'search'],
			label: 'Search',
			path: '/search',
			submenu: true,
			exact: false,
			items: [
				{ icon: ['fad', 'user-secret'], label: 'People', path: '/search/people', exact: true },
				{ icon: ['fad', 'car'], label: 'Vehicles', path: '/search/vehicles', exact: true },
				{ icon: ['fad', 'raygun'], label: 'Firearms', path: '/search/firearms', exact: true },
				{ icon: ['fad', 'file-user'], label: 'Warrants', path: '/search/warrants', exact: true },
				{ icon: ['fad', 'file-alt'], label: 'Reports', path: '/search/reports', exact: true },
			],
		},
		{ name: 'bolo', icon: ['fad', 'eye'], label: "BOLO's", path: '/bolos', exact: false },
		{ name: 'warrants', icon: ['fad', 'file-user'], label: "Active Warrants", path: '/warrants', exact: false },
		// {
		// 	name: 'forums',
		// 	icon: ['fad', 'file-user'],
		// 	label: 'Forums',
		// 	external: true,
		// 	newTab: true,
		// 	path: 'https://reactrp.com/',
		// },
	],
};

const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1,
		background: theme.palette.secondary.dark,
		width: '100%',
		height: 86,
		zIndex: 100,
	},
	cityLogo: {
		width: 80,
		margin: '0 10px',
	},
	cityLogoLink: {
		background: theme.palette.secondary.main,
		'&:hover': {
			background: theme.palette.secondary.light,
			transition: 'background ease-in 0.15s',
		},
	},
	navLinks: {
		display: 'inline-flex',
		alignItems: 'center',
		width: '100%',
	},
	mobileNav: {
		width: '100%',
		maxWidth: 360,
		backgroundColor: theme.palette.secondary.dark,
	},
	navbar: {
		backgroundColor: theme.palette.secondary.light,
	},
	menuButton: {
		display: 'inline',
		color: theme.palette.text.main,
		fontSize: 18,
		padding: '0 10px',
		lineHeight: '18px',
		textDecoration: 'none',
		borderRadius: 5,
		'&:first-child': {
			marginLeft: 0,
		},
		'&:last-child': {
			marginRight: 0,
		},
		'& svg': {
			color: theme.palette.alt.green,
			fontSize: 12,
			height: 21,
			lineHeight: '50px',
			width: '30px !important',
			textAlign: 'center',
			position: 'relative',
			top: 1,
			transition: 'all ease 0.4s',
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
	title: {
		flexGrow: 1,
	},
}));

export default connect()((props) => {
	const classes = useStyles();
	const theme = useTheme();
	const location = useLocation();
	const isMobile = !useMediaQuery(theme.breakpoints.up('lg'));
	const token = useSelector((state) => state.user.token);
	const session = useSelector((state) => state.user.session);
	const cData = useSelector((state) => state.user.character);
	const [mobileOpen, setMobileOpen] = useState(false);

	useEffect(() => {
		if (!isMobile) {
			setMobileOpen(false);
		}
	}, [isMobile]);

	const usable = session != null && cData != null && session.job === 'police';

	const [open, setOpen] = useState(false);
	const onClick = (e) => {
		e.preventDefault();
		if (e.currentTarget.name === open) {
			setOpen(false);
		} else {
			setOpen(e.currentTarget.name);
		}
	};

	const handleMenuClose = () => {
		if (!usable) return;
		setMobileOpen(false);
	};

	const [compress, setCompress] = useState(false);
	const onCompress = (e) => {
		e.preventDefault();
		setCompress(!compress);
	};

	return (
		<>
			<div className={classes.root}>
				<AppBar elevation={0} className={classes.navbar}>
					<Toolbar disableGutters>
						<div className={classes.title}>
							<div className={classes.navLinks}>
								<Link to="/" className={classes.cityLogoLink}>
									<img src={cityLogo} className={classes.cityLogo} />
								</Link>
								<Divider orientation="vertical" flexItem />
								{isMobile ? (
									<IconButton onClick={() => setMobileOpen(true)}>
										<Menu />
									</IconButton>
								) : null}
								{token != null ? (
									<Search />
								) : null}
							</div>
						</div>
						<UserMenu />
					</Toolbar>
				</AppBar>
			</div>

			{!isMobile ? (
				<NavLinksEl
					links={session != null && cData != null && NavLinks[session.job] != null && session.job === cData.Job.job ? NavLinks[session.job] : NavLinks.guest}
					onClick={onClick}
					handleMenuClose={handleMenuClose}
					open={open}
					compress={compress}
				/>
			) : null}

			<Drawer
				PaperProps={{ className: classes.mobileNav }}
				anchor="left"
				open={mobileOpen && isMobile}
				onClose={() => setMobileOpen(false)}
			>
				<NavLinksEl
					links={session != null && cData != null && NavLinks[session.job] != null && session.job === cData.Job.job ? NavLinks[session.job] : NavLinks.guest}
					onClick={onClick}
					handleMenuClose={handleMenuClose}
					open={open}
					compress={false}
				/>
			</Drawer>
		</>
	);
});
