const _ = require('lodash');
const match = require('../models/match');
const matchSubscription = require('../models/subscription');
const user = require('../models/user');
const __ = require('../helpers/locales');
const { createError } = require('../errors')


/**
 * Fetch match info filter according query object
 */
const getMatchInfo = async (qFilter) => {
  const matchInfo = await match.find({ isActive: true, ...qFilter }, { __v: 0 }).lean();
  return matchInfo;
}

/**
 * Schedule a new match
 * @param {*} param0 
 * @returns 
 */
const scheduleMatch = async ({ matchDate, startTime, stadium, teams }) => {

  const newMatch = await new match({
    matchDate: new Date(matchDate),
    startTime,
    stadium,
    teams
  })
  await newMatch.save();
  const matchInfo = await getMatchInfo({ _id: newMatch._id });
  return { ..._.head(matchInfo) }
}

/**
 * Marked canceled matched
 * @param {*} param0 
 * @returns 
 */
const cancelMatch = async ({ matchId }) => {
  const matchInfo = await match.findById(matchId);
  if (!matchInfo)
    throw createError.BadRequest(__.invalid_match_reference);
  matchInfo.isActive = false;
  matchInfo.status = 'cancelled';
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
  return __.successfully_unsubscribed;
}

const getDashboard = async () => {
  const matches = await getMatchInfo({});
  const registeredSubscribers = await matchSubscription.count({ isActive: true });
  const responseObject = {
    "registered_watchers_online": registeredSubscribers,
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
};