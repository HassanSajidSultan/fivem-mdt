import React, { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import {
	makeStyles,
	Grid,
	ButtonGroup,
	Button,
	Dialog,
	AppBar,
	Toolbar,
	IconButton,
	Slide,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
} from '@material-ui/core';
import { useHistory, useParams } from 'react-router-dom';
import Moment from 'react-moment';

import { Sanitize } from '../../utils/Parser';
import BoloTypes from '../../BoloTypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		background: theme.palette.secondary.dark,
		padding: 22,
	},
	loading: {
		textAlign: 'center',
		fontSize: 30,
	},
	title: {
		fontSize: 30,
		fontWeight: 'bold',
		borderBottom: `1px solid ${theme.palette.border.divider}`,
	},
	authorDetails: {
		borderBottom: `1px solid ${theme.palette.border.divider}`,
		padding: '10px 0',
		lineHeight: '36px',
	},
	boloTime: {
		color: theme.palette.primary.main,
		fontWeight: 'bold',
	},
	boloAuthor: {
		color: theme.palette.primary.main,
		fontWeight: 'bold',
	},
	boloAuthorTitle: {
		color: theme.palette.text.alt,
		fontWeight: 'normal',
	},
	boloIcon: {
		float: 'right',
	},
	boloContent: {},
	header: {
		fontSize: 20,
		fontWeight: 500,
		color: theme.palette.primary.main,
		textAlign: 'left',
		lineHeight: '48px',
		borderBottom: `1px solid ${theme.palette.border.divider}`,
		marginBottom: 10,
	},
	history: {
		backgroundColor: theme.palette.secondary.dark,
	},
	button: {
		background: theme.palette.secondary.dark,
		color: theme.palette.warning.main,
		'&:hover': {
			backgroundColor: `${theme.palette.warning.main}14`,
		},
	},
	buttonNegative: {
		background: theme.palette.secondary.dark,
		color: theme.palette.error.main,
		'&:hover': {
			backgroundColor: `${theme.palette.error.main}14`,
		},
	},
	buttonPositive: {
		background: theme.palette.secondary.dark,
		color: theme.palette.success.main,
		'&:hover': {
			backgroundColor: `${theme.palette.success.main}14`,
		},
	},
	active: {
		color: theme.palette.success.main,
		fontWeight: 'bold',
	},
	inactive: {
		color: theme.palette.error.main,
		fontWeight: 'bold',
	},
}));

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});

export default connect()((props) => {
	const classes = useStyles();
	const history = useHistory();
	const { id } = useParams();
	const data = useSelector((state) => state.alerts.data);
	const alertsSocket = useSelector((state) => state.io.sockets.alerts);

	const [historyOpen, setHistoryOpen] = useState(false);

	const [bolo, setBolo] = useState(null);
	useEffect(() => {
		if (id == null) {
			history.goBack();
		} else {
			let b = data.bolo != null ? data.bolo.filter((b) => b._id === id)[0] : null;
			if (b != null) console.log(b.type);
			if (b != null) b.typeData = BoloTypes.filter((bT) => bT.value === b.type)[0];
			setBolo(b);
		}
	}, [data]);

	const deactivate = () => {
		alertsSocket.io.emit('dismissBolo', bolo, () => {
			toast.success('BOLO Has Been Deactivated');
		});
	};

	const reactivate = () => {
		alertsSocket.io.emit('activateBolo', bolo, () => {
			toast.success('BOLO Has Been Reactivated');
		});
	};

	const edit = () => {
		history.push(`/create/bolo/${bolo._id}`);
	};

	if (bolo == null || data.bolo == null) {
		return null;
	} else {
		return (
			<div className={classes.wrapper}>
				<div className={classes.title}>
					{bolo.typeData.label}: {bolo.title}
					<FontAwesomeIcon icon={['fad', bolo.typeData.icon]} className={classes.boloIcon} />
				</div>
				<Grid container className={classes.authorDetails}>
					<Grid item xs={6}>
						Created On <Moment className={classes.boloTime} date={bolo.time} format="dddd, MMMM Do YYYY" />
						{' at '}
						<Moment className={classes.boloTime} date={bolo.time} format="hh:mm:ssa" />{' by '}
						<span className={classes.boloAuthor}>
							{bolo.author.name} <span className={classes.boloAuthorTitle}>({bolo.author.title})</span>
						</span>
					</Grid>
					<Grid item xs={6} style={{ textAlign: 'right' }}>
						<ButtonGroup>
							<Button onClick={() => setHistoryOpen(true)}>View History</Button>
							<Button className={classes.button} onClick={edit}>
								Edit
							</Button>
							{bolo.active ? (
								<Button className={classes.buttonNegative} onClick={deactivate}>
									Deactivate
								</Button>
							) : (
								<Button className={classes.buttonPositive} onClick={reactivate}>
									Reactivate
								</Button>
							)}
						</ButtonGroup>
					</Grid>
					<Grid item xs={12} style={{ textAlign: 'center', fontSize: 20 }}>
						{bolo.active ? (
							<div>
								BOLO Is <span className={classes.active}>Active</span>
							</div>
						) : (
							<div>
								BOLO Is <span className={classes.inactive}>Inactive</span>
							</div>
						)}
					</Grid>
				</Grid>
				<Grid container spacing={2} className={classes.boloContent}>
					<Grid item xs={12} md={4}>
						<div className={classes.header}>Description</div>
						{Sanitize(bolo.description)}
					</Grid>
					<Grid item xs={12} md={8}>
						<div className={classes.header}>Event/Incident</div>
						{Sanitize(bolo.event)}
					</Grid>
				</Grid>
				<Dialog
					fullScreen
					open={historyOpen}
					onClose={() => setHistoryOpen(false)}
					TransitionComponent={Transition}
					PaperProps={{
						className: [classes.history],
					}}
				>
					<AppBar className={classes.appBar} position="static">
						<Toolbar>
							<IconButton
								edge="start"
								color="inherit"
								onClick={() => setHistoryOpen(false)}
								aria-label="close"
							>
								<FontAwesomeIcon icon="times" />
							</IconButton>
							<h3>History For {bolo._id}</h3>
						</Toolbar>
					</AppBar>
					<TableContainer className={classes.table}>
						<Table stickyHeader>
							<TableHead>
								<TableRow>
									<TableCell component="th" scope="row">
										Time
									</TableCell>
									<TableCell component="th" scope="row">
										Action
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{bolo.history
									.sort((a, b) => b.time - a.time)
									.map((row) => (
										<TableRow key={row.name}>
											<TableCell>
												<Moment date={row.time} format="dddd, MMMM Do YYYY" />
											</TableCell>
											<TableCell>{row.message}</TableCell>
										</TableRow>
									))}
							</TableBody>
						</Table>
					</TableContainer>
				</Dialog>
			</div>
		);
	}
});
