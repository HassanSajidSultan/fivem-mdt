import React, { useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import {
	makeStyles,
	Backdrop,
	CircularProgress,
	TextField,
	Paper,
	MenuItem,
	ButtonGroup,
	Button,
} from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { Alert } from '@material-ui/lab';
import { toast } from 'react-toastify';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		width: '40%',
		padding: 50,
		background: theme.palette.secondary.light,
		borderRadius: 0,
	},
	header: {
		fontSize: 20,
		fontColor: theme.palette.alt.green,
		fontWeight: 'bold',
	},
	backdrop: {
		zIndex: theme.zIndex.drawer + 1,
		color: '#fff',
	},
	buttonNegative: {
		width: '-webkit-fill-available',
		padding: 5,
		fontSize: 12,
		color: theme.palette.error.main,
		'&:hover': {
			backgroundColor: `${theme.palette.error.main}14`,
			transition: 'background-color ease-in 0.15s',
		},
	},
	buttonPositive: {
		width: '-webkit-fill-available',
		padding: 5,
		fontSize: 12,
		color: theme.palette.success.main,
		'&:hover': {
			backgroundColor: `${theme.palette.success.main}14`,
			transition: 'background-color ease-in 0.15s',
		},
	},
	btnGroup: {
		marginTop: 25,
    },
    loadWrapper: {
        width: 'fit-content',
        margin: 'auto',
        textAlign: 'center',
    },
    loadText: {
        fontSize: 35,
        color: theme.palette.alt.green,
        fontWeight: 'bold'
    }
}));

export default connect()((props) => {
	const classes = useStyles();
	const history = useHistory();
	const jobSocket = useSelector((state) => state.io.sockets.job);

	const [sign, setSign] = useState('');
	const [idsLoading, setIdsLoading] = useState(false);
	const [id, setId] = useState('');
	const [idError, setIdError] = useState(null);
	const [usedIds, setUsedIds] = useState(Array());

	const [submitting, setSubmitting] = useState(false);
	const [formError, setFormError] = useState(false);

	const [callsignData, setCallsignData] = useState(null);
	useEffect(() => {
		if (jobSocket != null) {
			jobSocket.io.emit('getCallsignData');
			jobSocket.io.on('receiveCallsignData', (data) => {
				setCallsignData(data);
				jobSocket.io.off('receiveCallsignData');
			});
		}
	}, [jobSocket]);

	const onSignChange = (e) => {
		setSign(e.target.value);

		setIdsLoading(true);
		jobSocket.io.emit('getCallsignIds', e.target.value);
		jobSocket.io.on('receiveCallsignIds', (data) => {
			setUsedIds(data);
			setIdsLoading(false);
			jobSocket.io.off('receiveCallsignIds');
		});
	};

	const onIdChange = (e) => {
		if (e.target.value !== '') {
			let whore = Math.trunc(e.target.value);
			if (usedIds.filter((i) => i.identifier === whore).length > 0) {
				setIdError(true);
			} else {
				setIdError(false);
			}

			setId(whore > 1 ? (whore <= 100 ? whore : 100) : 1);
		} else {
			setId(e.target.value);
		}
	};

	const reset = () => {
		setSign('');
		setIdsLoading(false);
		setId('');
		setIdError(null);
		setUsedIds(Array());
	};

	const onSubmit = (e) => {
		e.preventDefault();

        setSubmitting(true);
		jobSocket.io.emit('setCallsign', {
			sign: sign,
			identifier: id,
		});

		jobSocket.io.on('setCallsignFeedback', (data) => {
            setSubmitting(false);
			if (data) {
                props.dispatch({
                    type: 'LOGIN',
                    payload: {
                        token: data.token
                    },
                });
                props.dispatch({
                    type: 'SET_CHARACTER',
                    payload: {
                        character: data.character
                    }
                });
                
                history.replace('/');
                if (data.character != null) toast.success(`Callsign Set To ${sign} ${id}`);
			} else {
                reset();
                setFormError(true);
			}
		});
	};

	return (
		<div>
			<Backdrop className={classes.backdrop} open={true}>
				{callsignData != null ? (
					submitting ? (
						<Paper className={classes.wrapper}>
                            <div className={classes.loadWrapper}>
                                <CircularProgress color="primary" size={100} />
                                <div className={classes.loadText}>Setting Callsign</div>
                            </div>
						</Paper>
					) : (
						<Paper className={classes.wrapper}>
							<div className={classes.header}>Set Your Callsign</div>
							{formError ? <Alert>Unable To Set Callsign</Alert> : null}
							<form onSubmit={onSubmit}>
								<TextField
									className={classes.input}
									fullWidth
									select
									label="Callsign"
									name="callsign"
									required
									onChange={onSignChange}
									value={sign}
								>
									{Object.keys(callsignData).map((key) => {
										let option = callsignData[key];
										return (
											<MenuItem key={option.sign} value={option.sign}>
												{option.sign}
											</MenuItem>
										);
									})}
								</TextField>
								{!idsLoading ? (
									<TextField
										value={id}
										className={classes.input}
										fullWidth
										label="Identifier"
										name="identifier"
										type="number"
										required
										error={idError}
										helperText={idError ? 'Identifier Already In Used' : null}
										onChange={onIdChange}
										disabled={sign === ''}
										inputProps={{
											min: 1,
											max: 100,
											step: 1,
										}}
									/>
								) : (
									<CircularProgress color="primary" size={35} />
								)}
								<ButtonGroup className={classes.btnGroup} fullWidth>
									<Button className={classes.buttonNegative} onClick={reset}>
										Reset
									</Button>
									<Button className={classes.buttonPositive} type="submit">
										Submit
									</Button>
								</ButtonGroup>
							</form>
						</Paper>
					)
				) : (
					<CircularProgress color="primary" size={100} />
				)}
			</Backdrop>
		</div>
	);
});
