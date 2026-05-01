const semver = require('semver');
module.exports = semver.satisfies.bind(semver);
