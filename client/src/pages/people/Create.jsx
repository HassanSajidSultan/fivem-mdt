import React, { useState, useMemo, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import {
	makeStyles,
	Paper,
	ButtonGroup,
	Button,
	TextField,
	CircularProgress,
	Collapse,
	Grid,
	Avatar,
	FormControlLabel,
	Checkbox,
	MenuItem,
} from '@material-ui/core';
import Moment from 'react-moment';
import { Autocomplete, Alert } from '@material-ui/lab';
import { useHistory } from 'react-router-dom';
import { throttle, debounce } from 'lodash';

const Races = [
	{ value: 'white', label: 'White' },
	{ value: 'black', label: 'Black' },
	{ value: 'hispanic', label: 'Hispanic' },
	{ value: 'unknown', label: 'Unknown' },
];

const BodyType = [
	{ value: 'skinny', label: 'Skinny' },
	{ value: 'overweight', label: 'Overweight' },
]

const useStyles = makeStyles((theme) => ({
	wrapper: {
		background: theme.palette.secondary.dark,
		padding: 22,
	},
	pageHeader: {
		fontSize: 20,
		fontWeight: 500,
		padding: '0 7px',
		color: theme.palette.text.main,
		textAlign: 'left',
		lineHeight: '48px',
	},
	formWrapper: {
		borderRadius: 0,
		border: '1px solid #e0e0e008',
		background: theme.palette.secondary.light,
		padding: 10,
	},
	button: {
		width: '-webkit-fill-available',
		padding: 5,
		background: theme.palette.secondary.dark,
		color: theme.palette.warning.main,
		'&:hover': {
			backgroundColor: `${theme.palette.warning.main}14`,
		},
	},
	buttonNegative: {
		width: '-webkit-fill-available',
		padding: 5,
		background: theme.palette.secondary.dark,
		color: theme.palette.error.main,
		'&:hover': {
			backgroundColor: `${theme.palette.error.main}14`,
		},
	},
	buttonPositive: {
		width: '-webkit-fill-available',
		padding: 5,
		background: theme.palette.secondary.dark,
		color: theme.palette.success.main,
		'&:hover': {
			backgroundColor: `${theme.palette.success.main}14`,
		},
	},
	creatorInput: {
		margin: '10px 0',
	},
	btnGroup: {
		width: '100%',
		marginTop: 20,
	},
	infoContainer: {
		padding: 20,
		background: theme.palette.secondary.dark,
		marginTop: 10,
	},
	header: {
		fontSize: 20,
		fontWeight: 500,
		padding: '0 7px',
        color: theme.palette.text.main,
		textAlign: 'left',
		lineHeight: '48px',
	},
	infoSubContainer: {
		background: theme.palette.secondary.main,
		marginTop: 25,
		'&:first-child': {
			marginTop: 0,
		},
	},
	infoSection: {
		padding: 10,
		borderLeft: `1px solid ${theme.palette.border.main}`,
		borderBottom: `1px solid ${theme.palette.border.main}`,
		'&:last-child': {
			borderRight: `1px solid ${theme.palette.border.main}`,
		},
	},
	itemWrapper: {
		padding: 10,
		color: theme.palette.text.alt,
	},
	index: {
		color: theme.palette.text.main,
		fontWeight: 'bold',
	},
	existError: {
		marginBottom: 25,
	},
	mugshot: {
		height: 250,
		width: 250,
		margin: 'auto',
		background: theme.palette.text.alt,
		border: `2px solid ${theme.palette.text.alt}`,
	},
	mugshotInput: {
		marginTop: 25,
	},
	gangNameInput: {
		marginLeft: 25,
	},
	crimFlags: {
		background: theme.palette.secondary.dark,
		borderRadius: 0,
		marginBottom: 15,
		transition: 'border ease-in 0.15s',
		'&:last-child': {
			marginBottom: 0,
		},
	},
	flagTitle: {
		fontSize: 20,
		fontWeight: 500,
		padding: '0 7px',
        color: theme.palette.text.alt,
		textAlign: 'left',
		lineHeight: '48px',
	},
	crimFlag: {
		display: 'block',
		margin: 10,
		width: '-webkit-fill-available',
	},
}));

const initState = {
	mugshot: '',
	violent: false,
	gang: false,
	gangName: '',
	mental: false,
	race: '',
	bodyType: '',
};

export default connect()((props) => {
	const history = useHistory();
	const classes = useStyles();

	const jobSocket = useSelector((state) => state.io.sockets.job);
	const searchSocket = useSelector((state) => state.io.sockets.search);

	const [open, setOpen] = React.useState(false);
	const [searchVal, setSearchVal] = React.useState('');
	const [options, setOptions] = React.useState(Array());
	const [loading, setLoading] = useState(false);
	const [exists, setExists] = useState(false);

	const [selectedChar, setSelectedChar] = useState(null);
	const [expanded, setExpanded] = useState(false);

	const [state, setState] = useState(initState);

	const fetch = useMemo(
		() =>
			debounce((value) => {
				setLoading(true);
				setOptions(Array());

				searchSocket.io.emit(
					'search',
					{
						type: 'character',
						value: value,
					},
					(results) => {
						setLoading(false);
						setState(initState);
						setOptions(results);
					},
				);
			}, 1000),
		[],
	);

	const check = useMemo(
		() =>
			throttle((owner) => {
				searchSocket.io.emit('checkCrimProfile', owner, (doesExist) => {
					setExists(doesExist);
				});
			}, 1000),
		[],
	);

	useEffect(() => {
		return () => {
			fetch.cancel();
			check.cancel();
		};
	}, []);

	const reset = () => {
		setSelectedChar(null);
		setOptions(Array());
		setSearchVal('');
		setState(initState);
	};

	const onSearchChange = (event) => {
		setSearchVal(event.target.value);
		if (event.target.value !== '' && event.target.value != null) {
			(async () => {
				fetch(event.target.value);
			})();
		} else {
			setOptions(Array());
			setLoading(false);
			setExpanded(false);
		}
	};

	const onSubmit = (e) => {
		e.preventDefault();

		if (selectedChar == null) return;

		jobSocket.io.emit('createCriminal', {
			character: selectedChar,
			...state,
		}, (nId) => {
			console.log(nId);
		});
	};

	const nameChange = (e, value) => {
		if (value != null) {
			setSelectedChar(value);
			check(value._id);
			setExpanded(true);
		} else {
			if (expanded) setExpanded(false);
			setExists(false);
		}
	};

	const mugshotChange = (e) => {
		setState({
			...state,
			mugshot: e.target.value,
		});
	};

	const gangNameChange = (e) => {
		setState({
			...state,
			gangName: e.target.value,
		});
	};

	const handleChange = (e) => {
		setState({
			...state,
			[e.target.name]: e.target.name === 'violent' || e.target.name === 'gang' || e.target.name === 'mental' ? e.target.checked : e.target.value,
		});
	};

	return (
		<div className={classes.wrapper}>
			<div className={classes.pageHeader}>New Criminal Record</div>
			<Paper className={classes.formWrapper}>
				<form onSubmit={onSubmit} className={classes.creatorBody}>
					<Autocomplete
						open={open}
						onOpen={() => {
							setOpen(true);
						}}
						onClose={() => {
							setOpen(false);
						}}
						value={selectedChar}
						onChange={nameChange}
						getOptionSelected={(option, value) => option._id === value._id}
						getOptionLabel={(option) => `${option.First} ${option.Last}`}
						options={options}
						loading={loading}
						renderInput={(params) => (
							<TextField
								{...params}
								fullWidth
								label="Name"
								name="name"
								variant="outlined"
								onChange={onSearchChange}
								value={searchVal}
								InputProps={{
									...params.InputProps,
									endAdornment: (
										<React.Fragment>
											{loading ? <CircularProgress color="inherit" size={20} /> : null}
											{params.InputProps.endAdornment}
										</React.Fragment>
									),
								}}
							/>
						)}
					/>
					<Collapse collapsedHeight={0} in={expanded} onExited={reset}>
						<div className={classes.infoContainer}>
							{selectedChar != null && exists ? (
								<Alert variant="filled" severity="error" className={classes.existError}>
									{selectedChar.First} {selectedChar.Last} Already Has A Record Created In The System.
								</Alert>
							) : null}
							{selectedChar != null ? (
								<>
									<Grid container className={classes.infoSubContainer}>
										<Grid item xs={12} className={classes.header}>
											Citizen Information
										</Grid>
										<Grid item xs={12} md={6} lg={4} className={classes.infoSection}>
											<div className={classes.itemWrapper}>
												<span className={classes.index}>Passport ID: </span>
												{selectedChar.User}
											</div>
											<div className={classes.itemWrapper}>
												<span className={classes.index}>Citizen ID: </span>
												{selectedChar._id}
											</div>
										</Grid>
										<Grid item xs={12} md={6} lg={4} className={classes.infoSection}>
											<div className={classes.itemWrapper}>
												<span className={classes.index}>First: </span>
												{selectedChar.First}
											</div>
											<div className={classes.itemWrapper}>
												<span className={classes.index}>Last: </span>
												{selectedChar.Last}
											</div>
											<div className={classes.itemWrapper}>
												<span className={classes.index}>Gender: </span>
												{selectedChar.Gender === 0 ? 'Male' : 'Female'}
											</div>
											<div className={classes.itemWrapper}>
												<span className={classes.index}>Date of Birth: </span>
												<Moment date={selectedChar.DOB} format="dddd, MMMM Do YYYY" />
											</div>
											<div className={classes.itemWrapper}>
												<span className={classes.index}>Age: </span>
												<Moment diff={selectedChar.DOB} unit="years" date={Date.now()} /> Years
												Old
											</div>
										</Grid>
										<Grid item xs={12} lg={4} className={classes.infoSection}>
											<div className={classes.itemWrapper}>
												<span className={classes.index}>Employment: </span>
												{selectedChar.Job.label}
											</div>
											{
												selectedChar.Job.job !== 'unemployed' ?
												<>
													<div className={classes.itemWrapper}>
														<span className={classes.index}>Position: </span>
														{selectedChar.Job.grade.label}
													</div>
													<div className={classes.itemWrapper}>
														<span className={classes.index}>Place of Employement: </span>
														{selectedChar.Job.workplace.label}
													</div>
												</> : null
											}
										</Grid>
										<Grid item xs={12}className={classes.infoSection}>
											Licensing Info ---- TODO
										</Grid>
									</Grid>

									{!exists ? (
										<Grid container className={classes.infoSubContainer}>
											<Grid item xs={12} md={4} className={classes.infoSection}>
												<Avatar className={classes.mugshot} src={state.mugshot} alt="M" />
												<TextField
													className={classes.mugshotInput}
													fullWidth
													label="Mugshot"
													name="mugshot"
													variant="outlined"
													onChange={mugshotChange}
													value={state.mugshot}
												/>
											</Grid>
											<Grid item xs={12} md={8} className={classes.infoSection}>
												<Paper className={classes.crimFlags}>
													<div className={classes.flagTitle}>Flags</div>
													<FormControlLabel
														className={classes.crimFlag}
														control={
															<Checkbox
																checked={state.violent}
																onChange={handleChange}
																name="violent"
																color="primary"
															/>
														}
														label="Violent Offender"
													/>
													<FormControlLabel
														className={classes.crimFlag}
														control={
															<Checkbox
																checked={state.gang}
																onChange={handleChange}
																name="gang"
																color="primary"
															/>
														}
														label="Gang Affiliated"
													/>
													<Collapse collapsedHeight={0} in={state.gang} direction="down">
														<TextField
															className={classes.gangNameInput}
															label="Gang"
															name="gangName"
															variant="outlined"
															onChange={gangNameChange}
															value={state.gangName}
														/>
													</Collapse>
													<FormControlLabel
														className={classes.crimFlag}
														control={
															<Checkbox
																checked={state.mental}
																onChange={handleChange}
																name="mental"
																color="primary"
															/>
														}
														label="Mentally Unstable"
													/>
												</Paper>
												<Paper className={classes.crimFlags}>
													<div className={classes.flagTitle}>Physical Description</div>
													<Grid container spacing={1}>
														<Grid item xs={12} md={6}>
															<TextField
																className={classes.crimFlag}
																fullWidth
																select
																label="Race"
																name="race"
																variant="outlined"
																required
																onChange={handleChange}
																value={state.race}
															>
																{Races.map((option) => (
																	<MenuItem key={option.value} value={option.value}>
																		{option.label}
																	</MenuItem>
																))}
															</TextField>
														</Grid>
														<Grid item xs={12} md={6}>
															<TextField
																className={classes.crimFlag}
																fullWidth
																select
																label="Body Type"
																name="bodyType"
																variant="outlined"
																required
																onChange={handleChange}
																value={state.bodyType}
															>
																{BodyType.map((option) => (
																	<MenuItem key={option.value} value={option.value}>
																		{option.label}
																	</MenuItem>
																))}
															</TextField>
														</Grid>
													</Grid>
												</Paper>
											</Grid>
										</Grid>
									) : null}
								</>
							) : null}
							<ButtonGroup className={classes.btnGroup}>
								<Button
									className={classes.buttonNegative}
									onClick={() => history.goBack()}
									type="reset"
								>
									Cancel
								</Button>
								<Button className={classes.button} onClick={() => setExpanded(false)}>
									Reset
								</Button>
								<Button className={classes.buttonPositive} type="submit" disabled={exists} autoFocus>
									Create
								</Button>
							</ButtonGroup>
						</div>
					</Collapse>
				</form>
			</Paper>
		</div>
	);
});
