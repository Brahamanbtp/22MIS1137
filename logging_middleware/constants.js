const LOGGING_ENDPOINT = 'http://4.224.186.213/evaluation-service/logs';

const ALLOWED_STACKS = ['backend', 'frontend'];

const ALLOWED_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];

const PACKAGE_ALLOWLIST = {
  backend: ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service'],
  frontend: ['api', 'component', 'hook', 'page', 'state', 'style'],
  shared: ['auth', 'config', 'middleware', 'utils'],
};

module.exports = {
  LOGGING_ENDPOINT,
  ALLOWED_STACKS,
  ALLOWED_LEVELS,
  PACKAGE_ALLOWLIST,
};