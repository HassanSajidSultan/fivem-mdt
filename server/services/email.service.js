import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';

let transport = nodemailer.createTransport({
	host: process.env.EMAIL_SMTP,
	port: process.env.EMAIL_PORT,
	secure: true,
	auth: {
		user: process.env.EMAIL_ACCOUNT,
		pass: process.env.EMAIL_PASSWORD,
	},
});

export const SendEmail = (to, subject, body, isHtml = null) => {
    if (typeof isHtml === 'object') {
        var template = handlebars.compile(fs.readFileSync(`./emails/${isHtml.file}.html`, 'utf-8').toString())
        body = template(isHtml.replacements);
    }

	transport.sendMail(
		{
			from: `"${process.env.EMAIL_SENDER_NAME}" ${process.env.EMAIL_SENDER_ADDRESS};`,
			to: to,
			subject: subject,
			text: isHtml == null ? body : null,
			html: isHtml != null ? body : null,
		},
		function (err, info) {
			if (err) {
				throw err;
			} else {
				console.log(info);
			}
		},
	);
};
