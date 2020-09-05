import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
	makeStyles,
	withStyles,
	Grid,
	Paper,
	Tabs,
	Tab,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';

import Login from './login';
import Register from './register';

const useStyles = makeStyles((theme) => ({
	inner: {
		height: 'fit-content',
		margin: 'auto',
		width: '100%',
	},
	innerinner: {
		background: theme.palette.secondary.light,
		border: '1px solid #e0e0e008',
		borderRadius: 0,
		height: 'fit-content',
	},
	form: {
		background: theme.palette.secondary.main,
		padding: 10,
		border: '1px solid #e0e0e008',
	},
	input: {
		width: '100%',
		margin: '10px 0',
	},
	loginBtn: {
		background: theme.palette.success.main,
		textTransform: 'none',
		'&:hover': {
			background: theme.palette.success.main,
			filter: 'brightness(1.1)',
			transition: 'filter ease-in 0.15s',
		},
	},
	public: {
		textAlign: 'center',
		fontSize: 16,
		fontWeight: 'bold',
		marginTop: 10,
		borderTop: `1px solid ${theme.palette.primary.main}`,
	},
}));

const StyledTabs = withStyles((theme) => ({
	indicator: {
		display: 'flex',
		justifyContent: 'center',
		backgroundColor: 'transparent',
		'& > span': {
			maxWidth: 40,
			width: '100%',
			backgroundColor: theme.palette.primary.main,
		},
	},
}))((props) => <Tabs {...props} TabIndicatorProps={{ children: <span /> }} />);

const StyledTab = withStyles((theme) => ({
	root: {
		textTransform: 'none',
		color: theme.palette.text.main,
		fontWeight: theme.typography.fontWeightRegular,
		fontSize: theme.typography.pxToRem(15),
		marginRight: theme.spacing(1),
		'&:focus': {
			opacity: 1,
		},
	},
}))((props) => <Tab disableRipple {...props} />);

export default connect()((props) => {
	const classes = useStyles();

	const [tab, setTab] = useState(0);
	const onChange = (event, tab) => {
		setTab(tab);
	};

	return (
		<div className={classes.wrapper}>
			<Grid container spacing={2} className={classes.inner}>
				<Grid item xs={12}>
					<Alert variant="filled" severity="info">
						Abuse of this system will result in permanent suspension
						from the React RP community.
					</Alert>
				</Grid>
				<Grid item xs={12}>
					<Grid
						container
						className={classes.innerinner}
						style={{ padding: 25 }}
					>
						<Grid item xs={12} md={4} lg={6} style={{textAlign: 'center'}}>
							<h3>
								Welcome to the Los Santos Electronic Criminal Records Management System
							</h3>
							<p style={{textAlign: 'left'}}>Access to this data is heavily restricted & monitored. Any attempt to abuse this system in any manor not intended or by unauthorized parties will be met with the harshest possible punishments.</p>
							<p style={{textAlign: 'left'}}>By using this system, it is assumed you understand & agree to all terms of use associated with this system and are responsible for any actions you, or performed by your registered account, perform.</p>
						</Grid>
						<Grid item xs={12} md={4} lg={6}>
							<Paper className={classes.form}>
								<Grid item xs={12}>
									<StyledTabs
										value={tab}
										onChange={onChange}
										centered
										scrollButtons="off"
									>
										<StyledTab label="Sign In" />
										<StyledTab label="Register" />
									</StyledTabs>
								</Grid>
								<Grid item xs={12} hidden={tab !== 0}>
									{tab === 0 && <Login />}
								</Grid>
								<Grid item xs={12} hidden={tab !== 1}>
									{tab === 1 && <Register />}
								</Grid>
							</Paper>
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		</div>
	);
});
