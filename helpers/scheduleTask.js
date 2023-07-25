const cron = require('node-cron');
const moment = require('moment');


const generateCronPattern = (datetime) => {

    const date = moment(datetime);

    const minute = date.format('mm');
    const hour = date.format('HH');
    const dayOfMonth = date.format('DD');
    const month = date.format('MM');
    const dayOfWeek = date.weekday();

    const cronPattern = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
    console.log(`Cron task assigned for: ${cronPattern}`)
    return cronPattern;
};



const taskAssign = function (dynamicDateTime, fn) {
    const cronPattern = generateCronPattern(dynamicDateTime);
    cron.schedule(cronPattern, fn);
}
module.exports = taskAssign;