import React, { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import {
	makeStyles,
	Paper,
	ButtonGroup,
	Button,
	TextField,
	MenuItem,
	Collapse,
} from '@material-ui/core';
import { useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Editor from '../../components/Editor';

const Types = [
	{ label: 'Person', value: 'person' },
	{ label: 'Vehicle', value: 'vehicle' },
];

const initState = {
	title: '',
	type: '',
	description: '',
	event: '',
}

export default connect()((props) => {
	const history = useHistory();
	const { id } = useParams();
	const mode = useSelector((state) => state.user.mode);
	const data = useSelector((state) => state.alerts.data);
	const alertsSocket = useSelector(state => state.io.sockets.alerts);
	
	const [open, setOpen] = useState(false);
	const [state, setState] = useState(initState);

	useEffect(() => {
		if (data.bolo != null && id != null) {
			reset();
		}
	}, [data])

	const onClick = () => {
		setOpen(!open);
	};
	
	const reset = () => {
		if (data.bolo != null && id != null) {
			let b = data.bolo.filter(b => b._id)[0];
			setState({
				title: b.title,
				type: b.type,
				description: b.description,
				event: b.event
			});
		} else {
			setState(initState);
		}
	}

	const onSubmit = (e) => {
		e.preventDefault();
		if (id != null) {
			alertsSocket.io.emit('editBolo', {
				_id: id,
				...state,
				time: Date.now()
			}, () => {
				toast.success('BOLO Updated')
			});
		} else {
			alertsSocket.io.emit('createBolo', {
				...state,
				time: Date.now()
			});
		}

		history.goBack();
	};

	const onChange = (e) => {
		setState({
			...state,
			[e.target.name]: e.target.value,
		});
	};

	const onSave = (content) => {
		setState({
			...state,
			event: content,
		});
	};

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
        creatorBody: {
            '& .Draftail-Editor': {
                background: theme.palette.secondary.dark,
                border: '1px solid #e0e0e008',
            },
            '& .Draftail-Toolbar': {
                background: theme.palette.secondary.main,
                color: theme.palette.text.main,
                borderBottom: `1px solid ${theme.palette.primary.main}`,
            },
            '& .DraftEditor-root': {
                color: theme.palette.text.main,
            },
        },
        btnGroup: {
            width: '100%',
            marginTop: 20,
        },
        editor: {
            marginTop: 10
        },
        label: {
            fontSize: 12,
            fontWeight: 400,
            color: mode === 'dark' ? theme.palette.text.primary : theme.palette.text.primary,
            width: '100%',
            paddingBottom: 10,
            borderBottom: `1px solid ${theme.palette.border.input}`
        }
    }));
	const classes = useStyles();

	return (
		<div className={classes.wrapper}>
			<div className={classes.pageHeader}>
				{id != null ? `Edit BOLO: ${id}` : 'New BOLO'}
			</div>
			<Paper className={classes.formWrapper}>
				<form onSubmit={onSubmit} className={classes.creatorBody}>
					<TextField
						className={classes.creatorInput}
						fullWidth
						select
						label="Type"
                        name="type"
						variant="outlined"
                        required
						onChange={onChange}
						value={state.type}
					>
						{Types.map((option) => (
							<MenuItem key={option.value} value={option.value}>
								{option.label}
							</MenuItem>
						))}
					</TextField>
					<Collapse collapsedHeight={0} in={state.type !== ''}>
						<>
							<TextField
								className={classes.creatorInput}
								fullWidth
								label="Title"
								name="title"
								variant="outlined"
								required
								onChange={onChange}
								value={state.title}
							/>
							<TextField
								className={classes.creatorInput}
								fullWidth
								label="Brief Description"
								name="description"
								variant="outlined"
								required
								onChange={onChange}
								value={state.description}
							/>
							<div className={classes.editor}>
								<div className={classes.label}>
									Summary of Event
								</div>
								<Editor value={state.event} onChange={onSave} />
							</div>
							<ButtonGroup className={classes.btnGroup}>
								<Button
									className={classes.buttonNegative}
									onClick={() => history.goBack()}
								>
									Cancel
								</Button>
								<Button
									className={classes.button}
									onClick={reset}
								>
									Reset
								</Button>
								<Button
									className={classes.buttonPositive}
									onClick={onClick}
									type="submit"
									autoFocus
								>
									{id != null ? 'Edit' : 'Create'}
								</Button>
							</ButtonGroup>
						</>
					</Collapse>
				</form>
			</Paper>
		</div>
	);
});
