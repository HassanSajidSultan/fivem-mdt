import React, { useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { makeStyles, CircularProgress, Fade } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import io from 'socket.io-client';

import Character from './Character';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		background: theme.palette.secondary.dark,
		borderTop: 0,
		textAlign: 'center',
		padding: 22,
		position: 'relative',
	},
	loadContainer: {
		height: 'fit-content',
		width: 'fit-content',
		margin: 'auto',
	},
	loadText: {
		color: theme.palette.text.main,
		fontSize: 25,
		marginTop: 20,
	},
	header: {
		fontSize: 20,
		fontWeight: 500,
		padding: '0 7px',
		color: theme.palette.text.main,
		textAlign: 'left',
		lineHeight: '48px',
	},
	server: {
		padding: 10,
		background: theme.palette.secondary.main,
		marginBottom: 10,
		'&:last-child': {
			marginBottom: 0,
		}
	}
}));

export default connect()((props) => {
	const classes = useStyles();
	const session = useSelector((state) => state.user.session);
	const cData = useSelector((state) => state.user.character);
	const userSocket = useSelector((state) => state.io.sockets.user);

	const [chars, setChars] = useState(null);

	const storeChars = (chars) => {
		setChars(chars);
	}

	useEffect(() => {
		if (cData != null) {
			userSocket.io.emit('setCharacter', null);
			// props.dispatch({
			// 	type: 'CLEAR_CHARACTER'
			// })
		}

		userSocket.io.emit('getCharacters');
		userSocket.io.on('receiveCharacters', storeChars);
		return () => {
			userSocket.io.off('receiveCharacters', storeChars);
		}
	}, []);

	return (
		<div className={classes.wrapper}>
			<div className={classes.header}>Select A Character</div>
			{chars == null ? (
				<div className={classes.loadContainer}>
					<CircularProgress size={100} />
					<div className={classes.loadText}>Loading Characters</div>
				</div>
			) : (
				<div className={classes.charList}>
					{Object.keys(chars).length > 0 ? (
						Object.keys(chars).map((key, i) => {
							let serverChars = chars[key];
							return (
								<div className={classes.server} key={`serverlist-${key}`}>
									<div className={classes.header}>Server</div>
									{
										serverChars.length > 0 ? (
											<>
												{serverChars.filter(c => c.Job.job === session.job).map((char, j) => {
													return <Character key={`char-${key}-${j}`} character={char} />;
												})}
												{serverChars.filter(c => c.Job.job !== session.job && c.InGame).map((char, j) => {
													return <Character key={`char-${key}-${j}`} character={char} />;
												})}
											</>
										) : (
											<Alert variant="filled" severity="error">
												No Characters
											</Alert>
										)
									}
								</div>
							);
						})
					) : (
						<Alert variant="filled" severity="error">
							No Characters
						</Alert>
					)}
				</div>
			)}
		</div>
	);
});
