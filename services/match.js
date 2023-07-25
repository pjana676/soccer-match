const moment = require('moment');
const _ = require('lodash');
const match = require('../models/match');
const matchSubscription = require('../models/subscription');
const user = require('../models/user');
const __ = require('../helpers/locales');
const { createError } = require('../errors')
const scheduleTask = require('../helpers/scheduleTask')


/**
 * Fetch match info filter according query object
 */
const getMatchInfo = async (qFilter) => {
  const matchInfo = await match.find(
    { isActive: true, ...qFilter },
    { __v: 0, matchStartDateTime: 0, matchEndDateTime: 0 })
    .lean();
  return matchInfo;
}


/**
 * Match end trigger at CallBack Function from schedule Task
 */
const scheduleTaskEndMatchCallBackFunction  = async () => {
  const matches = await match.findOne({
    isActive: true, 
    matchEndDateTime: {
      $gte: new Date().setMinutes(new Date().getMinutes() - 1),
      $lt: new Date()
    },
  })
  matches.status = 'ended';
  // matches.isActive = false;
  await matches.save()
  // eslint-disable-next-line no-undef
  io.emit('soccer_sync', await getDashboard())
}

/**
 * define call-back function to update the score randomly
 * Check if the match is in progress and there are remaining updates
 * Generate a random score update for each team
 * Schedule the next score update after 2 minutes
 */
const generateRandomScoreUpdate = async (matchId, remainingUpdate) => {
  const matchInfo = await match.findOne({ _id: matchId, status: 'in-progress' });
  if (!matchInfo)
    return
  if (remainingUpdate > 0) {
    const [team1Score, team2Score] = (matchInfo.score === 'NA') ? [0, 0] : matchInfo.score.split('-').map(Number);
    const newTeam1Score = team1Score + Math.floor(Math.random() * 4);
    const newTeam2Score = team2Score + Math.floor(Math.random() * 4);

    const updatedTeam1Score = Math.max(newTeam1Score, 0);
    const updatedTeam2Score = Math.max(newTeam2Score, 0);
    matchInfo.score = `${updatedTeam1Score}-${updatedTeam2Score}`;
    await matchInfo.save();
    // eslint-disable-next-line no-undef
    io.emit('soccer_sync', await getDashboard());
    const scoreUpdateInterval = Math.floor(Math.random() * 3) * 60 * 1000;
    setTimeout(() => {
      generateRandomScoreUpdate(matchId, remainingUpdate - 1);
    }, scoreUpdateInterval);
  }
}

/**
 * CallBack Function for schedule Task to track Match Start  
 */
const scheduleTaskStartMatchCallBackFunction  = async () => {
  const matches = await match.findOne({
    isActive: true, 
    matchStartDateTime: {
      $gte: new Date().setMinutes(new Date().getMinutes() - 1),
      $lt: new Date()
    },
  })
  matches.status = 'in-progress';
  matches.score = '0-0';
  await matches.save();

  scheduleTask(moment(matches.matchEndDateTime), scheduleTaskEndMatchCallBackFunction);
  // eslint-disable-next-line no-undef
  io.emit('soccer_sync', await getDashboard());
  // twice/thrice score update 
  const refreshCountRange = {min: 2, max: 3};
  const deltaRefreshCount = refreshCountRange.max - refreshCountRange.min;
  generateRandomScoreUpdate(
    matches._id,
    Math.round(refreshCountRange.min + Math.random() * deltaRefreshCount)
  )
}


/**
 * Schedule a new match
 * @param {*} param0 
 * @returns 
 */
const scheduleMatch = async ({ matchDate, startTime, stadium, teams }) => {
  const matchDateTime = `${matchDate} ${startTime}`;
  const newMatch = await new match({
    matchDate: new Date(matchDate),
    matchStartDateTime: new Date(moment(matchDateTime)),
    matchEndDateTime: new Date(moment(matchDateTime).add(5, 'm')),
    startTime,
    stadium,
    teams
  })
  await newMatch.save();
  const matchInfo = await getMatchInfo({ _id: newMatch._id });
  scheduleTask(moment(matchDateTime), scheduleTaskStartMatchCallBackFunction)
  // eslint-disable-next-line no-undef
  io.emit('soccer_sync', await getDashboard())
  return { ..._.head(matchInfo) }
}

/**
 * Marked canceled matched
 * @param {*} param0 
 * @returns 
 */
const cancelMatch = async ({ matchId }) => {
  const matchInfo = await match.findOne({ _id: matchId, status: 'not-started' });
  if (!matchInfo)
    throw createError.BadRequest(__.invalid_match_reference);
  matchInfo.isActive = false;
  matchInfo.status = 'cancelled';
  await matchInfo.save()
  await matchSubscription.updateMany({ match: matchInfo }, { $set: { isActive: false } });
  // eslint-disable-next-line no-undef
  io.emit('soccer_sync', await getDashboard())
  return __.message_cancelled
}

/**
 * User subscribe to match
 * @param {*} param0 
 * @returns 
 */
const matchSubscribe = async ({ userId, matchId }) => {
  const userInfo = await user.findById(userId);
  const matchInfo = await match.findById(matchId);
  // check matchId is valid or not
  if (!matchInfo)
    throw createError.BadRequest(__.invalid_match_reference);

  const subscriptionInfo = await matchSubscription.findOne({ user: userInfo, match: matchInfo });
  if (subscriptionInfo)
    throw createError.BadRequest(__.already_subscribed);

  const newSubscription = new matchSubscription({
    user: userInfo,
    match: matchInfo,
  })
  await newSubscription.save();
  // eslint-disable-next-line no-undef
  io.emit('soccer_sync', await getDashboard())

  return __.successfully_subscribed;
}

/**
 * User could mark unsubscribe to subscribed match
 * @param {*} userId 
 * @param {*} subscriptionId 
 * @returns 
 */
const matchUnSubscribe = async ({ userId, subscriptionId }) => {
  const userInfo = await user.findById(userId);

  const subscriptionInfo = await matchSubscription.findOne({ user: userInfo, _id: subscriptionId });
  if (!subscriptionInfo)
    throw createError.BadRequest(__.invalid_subscription_reference);

  await matchSubscription.findOneAndRemove({ user: userInfo, _id: subscriptionId })
  // eslint-disable-next-line no-undef
  io.emit('soccer_sync', await getDashboard())
  return __.successfully_unsubscribed;
}

/**
 * Dashboard data from all users
 * @returns 
 */
const getDashboard = async () => {
  const matches = await getMatchInfo();
  const registeredSubscribers = await matchSubscription.count({ isActive: true });
  const responseObject = {
    "registered_watchers_online": registeredSubscribers,
    "matches": matches,
  };
  return responseObject;
}

/**
 * Fetch dashboard data for registered user 
 * @param {*} param0 
 * @returns 
 */
const registerUserDashboard = async ({ userId }) => {
  const userInfo = await user.findById(userId);
  const registeredSubscribers = await matchSubscription.find({ isActive: true, user: userInfo }, { match: 1 }).lean();
  const qFilter = {};
  qFilter['_id'] = {
    "$in": registeredSubscribers.map((e) => e.match)
  }
  const matches = await getMatchInfo(qFilter);
  const responseObject = {
    "registered_watchers_online": registeredSubscribers.length,
    "matches": matches,
  };
  return responseObject;
}

module.exports = {
  getMatchInfo,
  scheduleMatch,
  cancelMatch,
  matchSubscribe,
  matchUnSubscribe,
  getDashboard,
  registerUserDashboard,
};