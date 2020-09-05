import React, { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core';
import { library } from '@fortawesome/fontawesome-svg-core';
import { far } from '@fortawesome/pro-regular-svg-icons';
import { fas } from '@fortawesome/pro-solid-svg-icons';
import { fal } from '@fortawesome/pro-light-svg-icons';
import { fad } from '@fortawesome/pro-duotone-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import CssBaseline from '@material-ui/core/CssBaseline';

import MDT from './MDT';
import ReactRP from './assets/font/Blacklisted.ttf';

library.add(far, fas, fal, fad, fab);

const ReactRPFont = {
	fontFamily: 'ReactRP',
	fontStyle: 'normal',
	fontDisplay: 'swap',
	fontWeight: 400,
	src: `url(${ReactRP}) format('truetype')`,
};

export default connect()((props) => {
	const session = useSelector(state => state.user.session);
	const theme = useSelector(state => state.user.mode);
	
	const muiTheme = createMuiTheme({
		typography: {
			fontFamily: ['Kanit', 'sans-serif'],
		},
		palette: {
			primary: {
				main: '#2b71bb',
				light: '#5297e2',
				dark: '#194879',
				contrastText: theme === 'dark' ? '#ffffff' : '#26292d',
			},
			secondary: {
				main: theme === 'dark' ? '#1f1f1f' : '#ffffff',
				light: theme === 'dark' ? '#2e2e2e' : '#F5F6F4',
				dark: theme === 'dark' ? '#121212' : '#EBEBEB',
				contrastText: theme === 'dark' ? '#ffffff' : '#2e2e2e',
			},
			error: {
				main: '#c75050',
				light: '#f77272',
				dark: '#802828',
			},
			success: {
				main: '#52984a',
				light: '#60eb50',
				dark: '#244a20',
			},
			warning: {
				main: '#f09348',
				light: '#f2b583',
				dark: '#b05d1a',
			},
			text: {
				main: theme === 'dark' ? '#ffffff' : '#2e2e2e',
				alt: theme === 'dark' ? '#cecece' : '#858585',
				light: '#ffffff',
				dark: '#000000',
			},
			alt: {
				green: '#008442',
				greenDark: '#064224',
			},
			border: {
				main: theme === 'dark' ? '#e0e0e008' : '#e0e0e008',
				light: '#ffffff',
				dark: '#26292d',
				input: theme === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
				divider: theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
			},
			type: theme,
		},
		overrides: {
			MuiCssBaseline: {
				'@global': {
					'@font-face': [ReactRPFont],
					'html': {
						overflow: 'hidden',
					},
					'@keyframes panic': {
						'0%, 49%': {
							color: '#c75050',
						},
						'50%, 100%': {
							color: '#913a3a',
						}
					}
				},
			},
			MUIRichTextEditor: {
				placeHolder: {
					position: 'relative',
				},
				CodeBlock: {
					backgroundColor: '#202225'
				},
				codeBlock: {
					backgroundColor: '#202225'
				},
				code: {
					backgroundColor: '#202225'
				},
			},
		},
	});

	return (
		<MuiThemeProvider theme={muiTheme}>
			<CssBaseline />
			<MDT />
		</MuiThemeProvider>
	);
});
