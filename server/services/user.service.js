import bcrypt from 'bcryptjs';
import mongodb from 'mongodb';
import AuthDatabase from './database.service.js';
import { SendEmail } from './email.service.js';

const VolatileUserData = [
    'role',
    'job',
    'active',
]

export const CheckEmail = async (email) => {
	return (
		(await AuthDatabase.db.collection('mdt_users').findOne({
			email: { $regex: new RegExp(email, 'i') },
		})) == null
	);
};

export const CheckUsername = async (username) => {
	return (
		(await AuthDatabase.db.collection('mdt_users').findOne({
			username: { $regex: new RegExp(username, 'i') },
		})) == null
	);
};

export const CheckClassCode = async (code) => {
	return await AuthDatabase.db.collection('mdt_class_code').findOne({
		code,
		active: true,
	});
};

export const CheckVerifyCode = async (code) => {
	return (
		(await AuthDatabase.db.collection('mdt_user_verificiations').findOne({
			_id: code,
		})) != null
	);
};

export const CheckCommunityAccountGame = async (sid) => {
	return await AuthDatabase.db.collection('users').findOne({
		sid,
	});
};

export const CheckCommunityAccount = async (sid) => {
	return (
		(await AuthDatabase.db.collection('mdt_users').findOne({
			sid,
		})) == null
	);
};

export const CheckToken = async (orig, curr, cb) => {
    let inv = false;
    for(let i = 0; i < VolatileUserData.length; i++) {
        let field = VolatileUserData[i];
        if (orig[field] !== curr[field]) {
            let res = await AuthDatabase.db.collection('mdt_users').findOne({
                _id: mongodb.ObjectID(orig.account)
            });

            cb({
                account: res._id,
                email: res.email,
                username: res.username,
                role: res.role,
                job: res.job,
                user: res.user != null ? res.user : null,
                sid: res.sid != null ? res.sid : null,
                active: res.active,
                verified: res.verified,
            });

            return;
        }
    }

    if (!inv) {
        cb();
    }
}

const CreateRegisterVerif = (id, email, cb) => {
    AuthDatabase.db.collection('mdt_user_verificiations').deleteOne({
        email: email,
    }, (err, res) => {
        AuthDatabase.db.collection('mdt_user_verificiations').insertOne(
            {
                email: email,
                account: id,
                expires: Date.now() + 1000 * 60 * 30,
            },
            (err, res) => {
                if (err) throw err;
                cb(res.insertedId);
            },
        );
    });
};

export const CreateUser = (email, username, password, regClass, cb) => {
	AuthDatabase.db.collection('mdt_users').insertOne(
		{
			email: email,
			username: username,
			password: password,
			code: regClass.code,
			verified: false,
			active: false,
            role: 'user',
            job: regClass.job,
            mode: 'dark',
            jobNotifications: true,
			stats: {
				created: Date.now(),
			},
		},
		(err, res) => {
			if (err) throw err;
			CreateRegisterVerif(res.insertedId, email, (id) => {
				SendEmail(
					email,
					'React RP Electronic Records Account Management',
					'',
					{
						file: 'registration',
						replacements: {
                            username: username,
							domain: process.env.MDT_ADDRESS,
							verifyCode: id,
						},
					},
				);
				cb();
			});
		},
	);
};

export const VerifyUserEmail = (code, cb) => {
	AuthDatabase.db.collection('mdt_user_verificiations').findOne(
		{
			_id: code,
		},
		(err, result) => {
            if (result.expires >= Date.now()) {
                AuthDatabase.db.collection('mdt_users').findOneAndUpdate(
                    {
                        _id: result.account,
                    },
                    {
                        $set: {
                            verified: true,
                            active: true,
                        },
                    },
                    { returnOriginal: false },
                    (err, result2) => {
                        if (err) throw err;
    
                        AuthDatabase.db
                            .collection('mdt_user_verificiations')
                            .deleteOne({
                                _id: code,
                            });
    
                        SendEmail(
                            result2.value.email,
                            'React RP Electronic Records Account Management',
                            '',
                            {
                                file: 'verified',
                                replacements: {
                                    username: result2.value.username,
                                    domain: process.env.MDT_ADDRESS,
                                },
                            },
                        );
    
                        cb({
                            account: result2.value._id,
                            email: result2.value.email,
                            username: result2.value.username,
                            role: result2.value.role,
                            mode: result2.value.mode,
                            jobNotifications: result2.value.jobNotifications,
                            sid: result2.value.sid != null ? result2.value.sid : null,
                            user: result2.value.user != null ? result2.value.user : null,
                            active: true,
                            verified: true
                        });
                    },
                );
            } else {
                AuthDatabase.db
                    .collection('mdt_user_verificiations')
                    .deleteOne({
                        _id: code,
                    });
                cb();
            }
		},
	);
};

export const ResetVerifyLink = (account, email, username, cb) => {
    CreateRegisterVerif(account, email, (id) => {
        SendEmail(
            email,
            'React RP Electronic Records Account Management',
            '',
            {
                file: 'registration',
                replacements: {
                    username: username,
                    domain: process.env.MDT_ADDRESS,
                    verifyCode: id,
                },
            },
        );
        cb();
    });
}

export const LinkCommunityAccount = (account, user, sid, cb) => {
	AuthDatabase.db.collection('mdt_users').findOneAndUpdate(
		{
			_id: account,
		},
		{
			$set: {
				sid: sid,
				user: user,
			},
		},
		{ returnOriginal: true },
		(err, res) => {
			if (err) throw err;

			cb(res != null);
		},
	);
};

export const GetUser = (username, password, cb) => {
    AuthDatabase.db.collection('mdt_users').findOne({
        username: { $regex: new RegExp(username, 'i') },
    }, async (err, res) => {
        if (err || res == null) { cb(false); return; }

        let isValid = await bcrypt.compare(
            password,
            res.password,
        );

        isValid ? cb(res) : cb(false);
    })
}

export const RefreshUser = (account, cb) => {
    AuthDatabase.db.collection('mdt_users').findOne({
        _id: account
    }, (err, res) => {
        cb({
            account: res._id,
            email: res.email,
            username: res.username,
            role: res.role,
            job: res.job,
            sid: res.sid,
            user: res.user,
            verified: res.verified,
            mode: res.mode,
            jobNotifications: res.jobNotifications,
            active: res.active,
            stats: res.stats
        });
    })
}

export const StoreUserTheme = (account, theme) => {
    let _ = AuthDatabase.db.collection('mdt_users').updateOne({
        _id: mongodb.ObjectID(account),
    }, 
    {
        $set: {
            mode: theme
        }
    });
}

export const AssignCallsign = (account, charId, callsign, cb) => {
	AuthDatabase.db.collection('mdt_users').findOneAndUpdate(
		{
            _id: charId,
            User: account,
		},
		{
			$set: {
                Job: {
                    callsign: callsign
                }
			},
		},
		{ returnOriginal: false },
		(err, res) => {
			if (err) throw err;

			cb(res);
		},
	);
};