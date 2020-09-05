import React, { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { makeStyles, Grid, Tabs, Tab } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Statuses from '../../Statuses';
import JobList from './JobList';

export const JobLabels = {
	police: { label: 'Police', labelSingle: 'Police', title: 'Police', icon: ['fad', 'siren-on'] },
	ems: { label: 'Medics', labelSingle: 'Medic', title: 'Medics', icon: ['fad', 'ambulance'] },
	tow: { label: 'Tow', labelSingle: 'Tow', title: 'Tows', icon: ['fad', 'ambulance'] },
	lawyer: { label: 'Laywer', labelSingle: 'Laywer', title: 'Laywers', icon: ['fad', 'ambulance'] },
	judge: { label: 'Judge', labelSingle: 'Judge', title: 'Judges', icon: ['fad', 'ambulance'] },
};

const useStyles = makeStyles((theme) => ({
	wrapper: {
		background: theme.palette.secondary.light,
		padding: 5,
		border: `1px solid ${theme.palette.border.main}`,
		borderRadius: 0,
	},
	header: {
		fontSize: 20,
		fontWeight: 500,
		padding: '0 7px',
        color: theme.palette.text.main,
		textAlign: 'left',
		lineHeight: '48px',
	},
	innerbody: {
		padding: 10,
		maxHeight: '50vh',
		overflowY: 'auto',
		overflowX: 'hidden',
		'&::-webkit-scrollbar': {
			width: 3,
		},
		'&::-webkit-scrollbar-thumb': {
			background: theme.palette.primary.main,
		},
		'&::-webkit-scrollbar-thumb:hover': {
			background: theme.palette.primary.dark,
		},
		'&::-webkit-scrollbar-track': {
			background: 'transparent',
		},
	},
}));

export default connect()((props) => {
	const classes = useStyles();
	const cData = useSelector((state) => state.user.character);
	const units = useSelector((state) => state.alerts.data.online);

	const [filter, setFilter] = useState(null);

	const [myStatus, setMyStatus] = useState(Statuses.filter((s) => s.value === 'offline')[0]);
	useEffect(() => {
		if (cData != null && units != null && units[cData.Job.job] != null && units[cData.Job.job].length > 0) {
			let filter = units[cData.Job.job].filter((u) => u._id === cData._id);
			if (filter.length > 0) {
				setMyStatus(Statuses.filter((s) => s.value === filter[0].Status)[0]);
			} else {
				setMyStatus(Statuses.filter((s) => s.value === 'offline')[0]);
			}
		} else {
			setMyStatus(Statuses.filter((s) => s.value === 'offline')[0]);
		}
	}, [units, cData]);

	const [online, setOnline] = useState({
		police: Array(),
		ems: Array(),
		tow: Array(),
		lawyer: Array(),
		judge: Array(),
	});

	useEffect(() => {
		if (cData != null && units != null && cData != null) {
			let tmp = {
				police: Array(),
				ems: Array(),
				tow: Array(),
			};

			Object.keys(units).map((uType) => {
				let l = units[uType];
				l.filter((o) => o._id !== cData.id).map((o) => {
					if (tmp[uType] != null && tmp[uType].filter((t) => t._id === o._id).length === 0 && o.Status !== 'offline') tmp[uType].push(o);
					return;
				});
			});
			setOnline(tmp);
		} else {
			setOnline({
				police: Array(),
				ems: Array(),
				tow: Array(),
			});
		}
	}, [cData, units]);

	return (
		<div className={classes.wrapper}>
			<div className={classes.header}>
				Who's Online
			</div>
			<div className={classes.innerbody}>
				<div className={classes.content}>
					{Object.keys(online).map((key, i) => {
						return filter == null || filter != null && filter.includes(key) ? (
							<JobList
								key={`joblist-${key}`}
								index={key}
								list={online[key]}
								title={JobLabels[key].title}
								myStatus={cData != null && key === cData.Job.job ? myStatus : null}
								statuses={Statuses}
							/>
						) : null;
					})}
				</div>
			</div>
		</div>
	);
});
