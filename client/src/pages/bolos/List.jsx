import React, { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { makeStyles, ButtonGroup, Button, Grid, TextField, MenuItem } from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import { useHistory } from 'react-router-dom';
import qs from 'query-string';

import Bolo from '../dashboard/jobs/Police/Bolo/Bolo';
import BoloTypes from '../../BoloTypes';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		background: theme.palette.secondary.main,
		padding: 22,
	},
	loading: {
		textAlign: 'center',
		fontSize: 30,
	},
	item: {
		padding: 10,
		background: theme.palette.secondary.main,
		border: `1px solid ${theme.palette.border.divider}`,
		'&:not(:last-child)': {
			borderBottom: 0,
		},
	},
	filters: {
		marginBottom: 10,
	},
	title: {
		fontSize: 25,
		borderBottom: `1px solid ${theme.palette.border.divider}`,
	},
	noResults: {
		width: '100%',
		textAlign: 'center',
		fontSize: 25,
		fontWeight: 'bold',
	},
	filters: {
		marginBottom: 10,
	},
	activeFilter: {
		color: theme.palette.success.main,
		backgroundColor: `${theme.palette.success.main}2e`,
		'&:hover': {
			backgroundColor: `${theme.palette.success.main}5e`,
			transition: 'background-color ease-in 0.15s',
		},
	},
	inactiveFilter: {
		color: theme.palette.text.alt,
	},
	extrabtns: {
		[theme.breakpoints.down('sm')]: {
			marginTop: 10,
		},
		[theme.breakpoints.up('md')]: {
			marginLeft: 10,
		},
	},
}));

const Types = [
	{
		value: 'all',
		label: 'All',
		icon: null,
	},
	...BoloTypes,
];

const States = [
	{
		value: 'all',
		label: 'All',
	},
	{
		value: true,
		label: 'Active',
	},
	{
		value: false,
		label: 'Inactive',
	},
];

export default connect()((props) => {
	const classes = useStyles();
	const history = useHistory();
	const bolos = useSelector((state) => state.alerts.data).bolo;
	const parsed = qs.parse(history.location.search);

	const [activeFilter, setActiveFilter] = useState(
		parsed.state != null ? (parsed.state !== 'all' ? parsed.state === 'true' : 'all') : true,
	);
	const [typeFilter, setTypeFilter] = useState(parsed.type != null ? parsed.type : 'all');

	const changeActiveFilter = (e) => {
		setActiveFilter(e.target.value);
		setPage(1);

		let query = { ...parsed, state: e.target.value };
		if (e.target.value === true) delete query.state;

		history.replace({
			pathname: history.location.pathname,
			search: qs.stringify(query),
		});
	};

	const changeTypeFilter = (e) => {
		setTypeFilter(e.target.value);
        setPage(1);

		let query = { ...parsed, type: e.target.value };
        if (e.target.value === 'all') delete query.type;
		history.replace({
			pathname: history.location.pathname,
			search: qs.stringify(query),
		});
	};

	const [filteredBolos, setBolos] = useState(bolos);
	const [boloAuthors, setBoloAuthors] = useState(Array());
	useEffect(() => {
		if (bolos != null) {
			let t = Array();
			bolos.map((bolo) => {
				if (activeFilter !== 'all' && bolo.active !== activeFilter) return;
				if (typeFilter != 'all' && bolo.type !== typeFilter) return;
				t.push(bolo);
			});
			setBolos(t);
		}
	}, [activeFilter, typeFilter, bolos]);

	const [pagi, setPage] = useState(parsed.page != null ? +parsed.page : 1);
	const [totalPages, setTotalPages] = useState(0);
	const handleChange = (event, value) => {
		setPage(value);

		let query = { ...parsed, page: value };
        if (value === 1) delete query.page;
		history.replace({
			pathname: history.location.pathname,
			search: qs.stringify(query),
		});
	};
	useEffect(() => {
		if (filteredBolos == null) return;
		setTotalPages(Math.ceil(filteredBolos.length / 21));
	}, [filteredBolos]);

	return (
		<Grid container spacing={2} className={classes.wrapper}>
			<Grid item xs={12} className={classes.filters}>
				<Grid container spacing={2}>
					<Grid item xs={12} md={6}>
						<TextField
							select
							fullWidth
							label="State"
							value={activeFilter}
							onChange={changeActiveFilter}
							variant="outlined"
						>
							{States.map((option) => (
								<MenuItem key={option.value} value={option.value}>
									{option.label}
								</MenuItem>
							))}
						</TextField>
					</Grid>
					<Grid item xs={12} md={6}>
						<TextField
							select
							fullWidth
							label="Type"
							value={typeFilter}
							onChange={changeTypeFilter}
							variant="outlined"
						>
							{Types.map((option) => (
								<MenuItem key={option.value} value={option.value}>
									{option.label}
								</MenuItem>
							))}
						</TextField>
					</Grid>
				</Grid>
			</Grid>
			{filteredBolos != null ? (
				filteredBolos.length > 0 ? (
					filteredBolos
						.sort((a, b) => b.time - a.time)
						.slice((pagi - 1) * 21)
						.slice(0, 21)
						.map((bolo, i) => {
							return <Bolo key={`bolo-${i}`} bolo={bolo} />;
						})
				) : (
					<div className={classes.noResults}>No BOLO's Match Your Filters</div>
				)
			) : null}
			{totalPages > 0 && (
				<Grid item xs={12}>
					<Pagination
						count={totalPages}
						page={pagi}
						onChange={handleChange}
						variant="outlined"
						shape="rounded"
						color="primary"
					/>
				</Grid>
			)}
		</Grid>
	);
});
