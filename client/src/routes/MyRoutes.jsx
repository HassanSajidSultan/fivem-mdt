import React from 'react';
import { connect, useSelector } from 'react-redux';
import { Route as RouterRoute, Switch, Redirect } from 'react-router';

import Unauthorized from './components/Unauthorized';
import NoRoute from './components/NoRoute';

import PublicRecords from '../pages/public';

import Auth from '../pages/auth';
import Recovery from '../pages/auth/recovery';
import Verify from '../pages/auth/verify';
import VerifyError from '../pages/auth/errors/verify';
import ActiveError from '../pages/auth/errors/active';
import ForumLink from '../pages/auth/link';
import CharSelect from '../pages/characters';

import Persistent from '../pages/persistent';
import PDCallsign from '../pages/characters/Callsign';

import People from '../pages/people';

import Dashboard from '../pages/dashboard';
import CreateCriminal from '../pages/people/Create';

import { List as BoloList, Create as CreateBolo, View as ViewBolo } from '../pages/bolos';

class Route {
	constructor(name, label, path, component, user, roles, jobs, isGuest, requireGuest) {
		this.name = name;
		this.label = label;
		this.path = path;
		this.component = component;
		this.user = user;
		this.roles = roles;
		this.jobs = jobs;

		this.isGuest = isGuest;
		this.requireGuest = requireGuest;
	}
}

export const Routes = [
	new Route('public-records', 'Public Records', '/', PublicRecords, false, null, null, true, true),
	new Route('login', 'Login & Register', '/login', Auth, false, null, null, true, true),
	new Route('verify', 'Verify Registration', '/verify', Verify, false, null, null, true, true),
	new Route('recover', 'Account Recovery', '/recover', Recovery, false, null, null, true, true),
	new Route('characters', 'Characters', '/characters', CharSelect, true, null, null, false, false),
	new Route('dashboard', 'Dashboard', '/', Dashboard, true, null, null, false, false),
	new Route('people', 'Criminal Search', '/search/people', People, true, null, null, false, false),
	new Route(
		'create-bolo',
		'Create BOLO',
		'/create/bolo/:id?',
		CreateBolo,
		true,
		null,
		['police', 'ems', 'judge', 'tow'],
		false,
		false,
	),
	new Route(
		'bolo-index',
		'View BOLO\'s',
		'/bolos',
		BoloList,
		true,
		null,
		['police', 'ems', 'judge', 'tow'],
		false,
		false,
	),
	new Route(
		'view-bolo',
		'View BOLO',
		'/bolos/:id',
		ViewBolo,
		true,
		null,
		['police', 'ems', 'judge', 'tow'],
		false,
		false,
	),
	new Route(
		'create-criminal',
		'Create Criminal Record',
		'/create/criminal',
		CreateCriminal,
		true,
		null,
		['police', 'judge'],
		false,
		false,
	),
];

export const searchRoutes = (searchVal) => {
	return Array();
};

export default connect()((props) => {
	const token = useSelector((state) => state.user.token);
	const session = useSelector((state) => state.user.session);
	const character = useSelector((state) => state.user.character);

	return (
		<Switch>
			{token == null &&
				Routes.filter((r) => r.isGuest && r.requireGuest).map((route) => {
					return <RouterRoute key={`${route.path}-guestOnly`} exact path={route.path} component={route.component} />;
				})}
			{token != null && session != null && (character == null || session.job === character.Job.job) ? (
				session.sid != null ? (
					session.verified ? (
						session.active ? (
							character != null ? (
								Routes.filter((r) => r.roles || r.jobs || (!r.isGuest && !r.requireGuest)).map((route) => {
									if (session != null || !route.user) {
										if (route.roles != null) {
											if (!route.roles.includes(session.role)) {
												return <RouterRoute key={`${route.path}-role`} exact path={route.path} component={Unauthorized} />;
											}
										}
	
										if (character != null) {
											if (route.jobs != null) {
												if (!route.jobs.includes(session.job)) {
													return <RouterRoute key={`${route.path}-job`} exact path={route.path} component={Unauthorized} />;
												}
											}
										}
	
										return <RouterRoute key={`${route.path}-user`} exact path={route.path} component={route.component} />;
									} else {
										return null;
									}
								})
							) : (
								<RouterRoute exact path="/" component={CharSelect} />
							)
						) : (
							<RouterRoute exact path="/" component={ActiveError} />
						)
					) : (
						<RouterRoute exact path="/" component={VerifyError} />
					)
				) : (
					<RouterRoute exact path="/" component={ForumLink} />
				)
			) : (
				token != null && session != null && character != null && session.job !== character.Job.job ? (
					Routes.filter((r) => r.isGuest && !r.requireGuest || (!r.roles && !r.jobs && (!r.isGuest && !r.requireGuest))).map((route) => {
						return <RouterRoute key={`${route.path}-guest`} exact path={route.path} component={route.component} />;
					})
				) : (
					Routes.filter((r) => r.isGuest && !r.requireGuest).map((route) => {
						return <RouterRoute key={`${route.path}-guest`} exact path={route.path} component={route.component} />;
					})
				)
			)}

			<RouterRoute path="*" component={NoRoute} />
		</Switch>
	);
});
