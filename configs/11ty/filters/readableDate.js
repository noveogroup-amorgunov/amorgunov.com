const {DateTime} = require('luxon');

module.exports = dateObj => {
  return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('dd/LL/yyyy');
};
