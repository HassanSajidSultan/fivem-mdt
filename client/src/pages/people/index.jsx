import React, { useState, useMemo, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import {
	makeStyles,
	Paper,
	ButtonGroup,
	Button,
	TextField,
    CircularProgress,
    IconButton,
	Collapse,
	Grid,
	Avatar,
	FormControlLabel,
	Checkbox,
	MenuItem,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useHistory } from 'react-router-dom';
import { throttle, debounce } from 'lodash';

import Person from './Person';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		background: theme.palette.secondary.dark,
		padding: 22,
	},
	pageHeader: {
		fontSize: 35,
		fontFamily: 'ReactRP',
		textAlign: 'center',
		padding: 20,
		color: theme.palette.primary.main,
	},
	formWrapper: {
		borderRadius: 0,
		border: '1px solid #e0e0e008',
		background: theme.palette.secondary.main,
		padding: 10,
	},
	button: {
        width: 'fit-content',
        display: 'block',
        margin: '25px auto 0 auto',
		padding: 5,
		background: theme.palette.secondary.main,
		color: theme.palette.success.main,
		'&:hover': {
			backgroundColor: `${theme.palette.success.main}14`,
		},
    },
	mugshot: {
		height: 250,
		width: 250,
		margin: 'auto',
		background: theme.palette.alt.green,
		border: `2px solid ${theme.palette.alt.green}`,
	},
    loaderWrapper: {
        textAlign: 'center',
    },
    loader: {
        color: theme.palette.primary.main,
        '--fa-secondary-color': theme.palette.alt.green,
    },
    loaderText: {
        color: theme.palette.text.main,
        fontSize: 35,
    },
    noResults: {
        color: theme.palette.error.main,
        fontSize: 25,
        fontWeight: 'bold',
        textAlign: 'center'
    }
}));

export default connect()((props) => {
	const history = useHistory();
	const classes = useStyles();

	const searchSocket = useSelector((state) => state.io.sockets.search);

	const [searchVal, setSearchVal] = React.useState('');
	const [options, setOptions] = React.useState(Array());
	const [searched, setSearched] = useState(false);
	const [loading, setLoading] = useState(false);

	const fetch = useMemo(
		() =>
			debounce((value) => {
				setLoading(true);
				setOptions(Array());

				searchSocket.io.emit(
					'search',
					{
						type: 'criminal',
						value: value,
					},
					(results) => {
						setLoading(false);
						setOptions(results);
                        setSearched(true);
					},
				);
			}, 1000),
		[],
	);

	useEffect(() => {
		return () => {
			fetch.cancel();
		};
	}, []);

	const reset = () => {
        setOptions(Array());
        setSearchVal('');
        setLoading(false);
        setSearched(false);
	};

	const onSearchChange = (event) => {
		setSearchVal(event.target.value);
        setSearched(false);
		if (event.target.value !== '' && event.target.value != null) {
			(async () => {
				fetch(event.target.value);
			})();
		} else {
			setOptions(Array());
            setLoading(false);
		}
    };

	return (
		<div className={classes.wrapper}>
			<div className={classes.pageHeader}>Search Criminal Records Database</div>
			<Paper className={classes.formWrapper}>
                <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    variant="outlined"
                    onChange={onSearchChange}
                    value={searchVal}
                    InputProps={{
                        endAdornment: (
                            <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20} /> : (searchVal !== '' ? <IconButton onClick={reset}><Close /></IconButton> : null)}
                            </React.Fragment>
                        ),
                    }}
                />
			</Paper>
			<Paper className={classes.formWrapper}>
                {
                    loading || searchVal !== '' && !searched ? (
                        <div className={classes.loaderWrapper}>
                            <FontAwesomeIcon icon={['fab', 'react']} size="4x" spin className={classes.loader} />
                            <div className={classes.loaderText}>Loading Results</div>
                        </div>
                    ) : (
                        options.length > 0 ?
                            options.map((char, i) => {
                                return (<Person character={char} />);
                            }) : (
                                searchVal !== '' && searched ?
                                <div className={classes.noResults}>
                                    No Results Found
                                    <Button className={classes.button}>Create Criminal Record</Button>
                                </div> : null
                            )
                    )
                }
			</Paper>
		</div>
	);
});
