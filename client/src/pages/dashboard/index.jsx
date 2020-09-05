import React from 'react';
import { connect, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core';

import Police from './Police';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		width: '100%',
	},
}));

export default connect()((props) => {
	const classes = useStyles();
	const session = useSelector(state => state.user.session);

	return (
		<div className={classes.wrapper}>
			{
				session != null ? (
					session.job === 'police' ? (
						<Police />
					) : (
						session.job === 'judge' ? (
							null
						) : (
							null
						)
					)
				) : null
			}
		</div>
	);
});
