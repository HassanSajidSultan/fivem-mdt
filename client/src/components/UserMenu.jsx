import React, { useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { Button, IconButton, Menu, MenuItem, Avatar } from '@material-ui/core';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { indigo, yellow } from '@material-ui/core/colors';

const useStyles = makeStyles((theme) => ({
	name: {
		fontWeight: 'bold',
		textTransform: 'uppercase',
		marginRight: 5,
	},
	job: {
		fontSize: 10,
	},
	userData: {
		display: 'inline-block',
		margin: '0 10px',
	},
	avatar: {
		height: 35,
		width: 35,
		background: theme.palette.secondary.light,
		color: theme.palette.text.main,
		border: `2px solid ${theme.palette.primary.main}`,
		'& svg': {
			fontSize: 15,
		},
	},
	menu: {
		background: theme.palette.secondary.light,
		borderRadius: 0,
		zIndex: 100,
	},
	menuIconButton: {
		color: theme.palette.text.main,
		margin: '0 10px',
		padding: 5,
		fontSize: 25,
		height: 35,
		width: 35,
		border: `2px solid ${theme.palette.secondary.light}`,
		'&:hover': {
			background: theme.palette.secondary.light,
			transition: 'background ease-in 0.15s',
			cursor: 'pointer',
		},
		'&.active': {
			background: theme.palette.secondary.dark,
			border: `2px solid ${theme.palette.alt.green}`,
			color: theme.palette.text.main,
		},
	},
	lightmode: {
		color: yellow[500],
	},
	darkmode: {
		color: indigo[900],
	},
}));

export default connect()((props) => {
	const classes = useStyles();
	const token = useSelector((state) => state.user.token);
	const session = useSelector((state) => state.user.session);
	const mode = useSelector((state) => state.user.mode);
	const cData = useSelector((state) => state.user.character);
	const ingame = useSelector((state) => state.user.ingame);
	const userSocket = useSelector((state) => state.io.sockets.user);
	const alertsSocket = useSelector((state) => state.io.sockets.alerts);

	const usable = alertsSocket != null && session != null && cData != null;

	const [anchorEl, setAnchorEl] = useState(null);
	const [open, setOpen] = useState(false);

	const onClick = (e) => {
		e.preventDefault();
		setAnchorEl(e.currentTarget);
		setOpen(!open);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		setOpen(false);
	};

	const onLogout = () => {
		handleMenuClose();

		userSocket.io.emit('logout');
		props.dispatch({
			type: 'LOGOUT',
		});
	};

	const toggleDarkmode = () => {
		handleMenuClose();
		let n = mode === 'dark' ? 'light' : 'dark';
		props.dispatch({
			type: 'SET_THEME',
			payload: n,
		});
		if (userSocket != null) userSocket.io.emit('changeTheme', n);
	};

	const getCreateMenu = () => {
		switch (session.job) {
			case 'police':
				return [
					<MenuItem onClick={handleMenuClose} key="create-incident" component={Link} to="/create/incident">
						New Incident Report
					</MenuItem>,
					<MenuItem onClick={handleMenuClose} key="create-criminal" component={Link} to="/create/criminal">
						New Criminal Record
					</MenuItem>,
					<MenuItem onClick={handleMenuClose} key="create-case" component={Link} to="/create/case">
						New Case
					</MenuItem>,
					<MenuItem onClick={handleMenuClose} key="create-bolo" component={Link} to="/create/bolo">
						New BOLO
					</MenuItem>,
					<MenuItem onClick={handleMenuClose} key="create-warrant" component={Link} to="/create/warrant">
						New Warrant
					</MenuItem>,
				];
			default:
				return <></>;
		}
	};

	return (
		<>
			{token != null ? (
				session != null && cData != null && session.job === cData.Job.job ? (
					<div>
						{usable && session.job === cData.Job.job ? (
							<IconButton
								className={classes.menuIconButton}
								component={NavLink}
								to="/create"
								name="create"
								onClick={onClick}
							>
								<FontAwesomeIcon icon={['fal', 'plus']} />
							</IconButton>
						) : null}
						<IconButton onClick={toggleDarkmode}>
							<FontAwesomeIcon
								icon={['fad', mode === 'dark' ? 'lightbulb-on' : 'lightbulb-slash']}
								className={mode === 'dark' ? classes.lightmode : classes.darkmode}
							/>
						</IconButton>
						<div className={classes.userData}>
							<Button color="inherit" onClick={onClick} name="user">
								<span className={classes.name}>
									{cData.First} {cData.Last}
								</span>
								{cData.Avatar != null ? (
									<Avatar className={classes.avatar} src={cData.Avatar} alt={cData.First.charAt(0)} />
								) : (
									<Avatar className={classes.avatar}>
										<FontAwesomeIcon icon={['fad', 'user-alt']} style={{ fontSize: 17 }} />
									</Avatar>
								)}
							</Button>
						</div>
					</div>
				) : (
					<div>
						<IconButton onClick={toggleDarkmode}>
							<FontAwesomeIcon
								icon={['fad', mode === 'dark' ? 'lightbulb-on' : 'lightbulb-slash']}
								className={mode === 'dark' ? classes.lightmode : classes.darkmode}
							/>
						</IconButton>
						<IconButton color="inherit" onClick={onClick} name="user" style={{ marginRight: 10 }}>
							<FontAwesomeIcon icon={['fad', 'user-alt']} style={{ fontSize: 17 }} />
						</IconButton>
					</div>
				)
			) : (
				<div>
					<IconButton onClick={toggleDarkmode}>
						<FontAwesomeIcon
							icon={['fad', mode === 'dark' ? 'lightbulb-on' : 'lightbulb-slash']}
							className={mode === 'dark' ? classes.lightmode : classes.darkmode}
						/>
					</IconButton>
					<IconButton className={classes.menuIconButton} color="inherit" component={NavLink} to="/login">
						<FontAwesomeIcon icon={['fad', 'user-alt']} style={{ fontSize: 17 }} />
					</IconButton>
				</div>
			)}
			{usable && session.job === cData.Job.job ? (
				<Menu
					anchorEl={anchorEl}
					getContentAnchorEl={null}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'center',
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'center',
					}}
					keepMounted
					open={open && anchorEl.name === 'user'}
					onClose={handleMenuClose}
				>
					<MenuItem disabled>
						{cData.First} {cData.Last} ({cData.Job.label} - {cData.Job.grade.label})
					</MenuItem>
					<MenuItem onClick={handleMenuClose} component={Link} to="/profile">
						Profile
					</MenuItem>
					<MenuItem onClick={handleMenuClose} component={Link} to="/characters" disabled={ingame}>
						Change Character
					</MenuItem>
					<MenuItem onClick={onLogout}>Logout</MenuItem>
				</Menu>
			) : (
				<Menu
					anchorEl={anchorEl}
					anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
					keepMounted
					transformOrigin={{ vertical: 'top', horizontal: 'right' }}
					open={open && anchorEl.name === 'user'}
					onClose={handleMenuClose}
				>
					<MenuItem onClick={onLogout}>Logout</MenuItem>
				</Menu>
			)}

			{usable && session.job === cData.Job.job && session.job === 'police' ? (
				<Menu
					anchorEl={anchorEl}
					getContentAnchorEl={null}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'center',
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'center',
					}}
					keepMounted
					open={open && anchorEl.name === 'create'}
					onClose={handleMenuClose}
					PaperProps={{
						className: [classes.menu],
					}}
				>
					{getCreateMenu()}
				</Menu>
			) : null}
		</>
	);
});
