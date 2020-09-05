import React from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { ListItem, ListItemIcon, ListItemText, Link } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const useStyles = makeStyles((theme) => ({
	link: {
		color: theme.palette.text.main,
		height: 60,
		transition: 'color ease-in 0.15s, background-color ease-in 0.15s',
		'& svg': {
			fontSize: 20,
			transition: 'color ease-in 0.15s',
		},
		'&:hover': {
			color: `${theme.palette.primary.main}`,
			cursor: 'pointer',
			'& svg': {
				color: `${theme.palette.primary.main}`,
			},
		},
	},
	external: {
		fontSize: '14px !important',
	}
}));

export default connect()((props) => {
	const classes = useStyles();

	return (
        <ListItem
            className={classes.link}
            button
            name={props.link.name}
            component={Link}
            href={props.link.path}
            target={props.link.newTab ? '_blank' : '_self'}
            onClick={props.onClick}
        >
            <ListItemIcon>
                <FontAwesomeIcon icon={props.link.icon} />
            </ListItemIcon>
            {!props.compress ? <ListItemText primary={props.link.label} /> : null}
            {!props.compress ? <FontAwesomeIcon className={classes.external} icon={['fad', 'external-link']} /> : null}
        </ListItem>
	);
});
