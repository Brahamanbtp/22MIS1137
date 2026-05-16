const axios = require('axios');
const {
	LOGGING_ENDPOINT,
	ALLOWED_STACKS,
	ALLOWED_LEVELS,
	PACKAGE_ALLOWLIST,
} = require('../../logging_middleware/constants');

function buildError(message, details) {
	return {
		success: false,
		message,
		details,
	};
}

function getToken() {
	return process.env.TOKEN || process.env.LOGGING_BEARER_TOKEN || process.env.LOGGING_TOKEN || process.env.BEARER_TOKEN || '';
}

function isValidString(value) {
	return typeof value === 'string' && value.trim().length > 0;
}

function isAllowedPackage(stack, packageName) {
	const sharedPackages = PACKAGE_ALLOWLIST.shared;

	if (sharedPackages.includes(packageName)) {
		return true;
	}

	return PACKAGE_ALLOWLIST[stack].includes(packageName);
}

async function Log(stack, level, packageName, message) {
	try {
		if (!isValidString(stack) || !ALLOWED_STACKS.includes(stack)) {
			return buildError('Invalid stack. Allowed values are backend and frontend.');
		}

		if (!isValidString(level) || !ALLOWED_LEVELS.includes(level)) {
			return buildError('Invalid level. Allowed values are debug, info, warn, error, and fatal.');
		}

		if (!isValidString(packageName) || !isAllowedPackage(stack, packageName)) {
			return buildError('Invalid packageName for the selected stack.');
		}

		if (!isValidString(message)) {
			return buildError('Invalid message. Message must be a non-empty string.');
		}

		const token = getToken();

		if (!isValidString(token)) {
			return buildError('Missing Bearer token. Set TOKEN, LOGGING_BEARER_TOKEN, LOGGING_TOKEN, or BEARER_TOKEN.');
		}

		const payload = {
			stack,
			level,
			package: packageName,
			message,
		};

		const response = await axios.post(LOGGING_ENDPOINT, payload, {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			timeout: 5000,
		});

		return {
			success: true,
			data: response.data,
		};
	} catch (error) {
		if (error && error.response) {
			return {
				success: false,
				message: 'Log request failed.',
				status: error.response.status,
				data: error.response.data,
			};
		}

		return buildError('Unable to send log request.', error && error.message ? error.message : 'Unknown error');
	}
}

module.exports = Log;
module.exports.Log = Log;