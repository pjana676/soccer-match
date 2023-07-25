const _ = require('lodash');
const match = require('../models/match');
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


module.exports = {
  scheduleMatch,
  cancelMatch,
};