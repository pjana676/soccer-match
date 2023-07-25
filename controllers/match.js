const Joi = require('joi');
const moment = require('moment');
const validate = require('../middlewares/validateRequest');
const matchService = require('../services/match');
const __ = require('../helpers/locales');
const { createError } = require('../errors');
const {
  Types: { ObjectId },
} = require('mongoose');

/**
 * Match info for all user including guest user
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const getDashboard = async (req, res, next) => {
  try {
    const matches = await matchService.getDashboard();
    res.success({ data: matches });
  } catch (error) {
    next(error)
  }
};

const scheduleMatchSchema = Joi.object({
  matchDateTime: Joi.date()
    .raw()
    .required()
    .label('matchDateTime'),
  stadium: Joi.string()
    .required()
    .label('stadium'),
  teams: Joi.array()
    .items(Joi.string().required()).max(2).min(2)
    .required()
    .label('teams'),
})

/**
 * scheduled match by admin
 */
const scheduleMatch = [
  validate(scheduleMatchSchema),
  async (req, res, next) => {
    try {
      const { matchDateTime, stadium, teams  } = req.body;
      const matchDate = moment(matchDateTime).format('YYYY-MM-DD');
      const startTime = moment(matchDateTime).format('HH:mm');
      if (new Date() >  moment(matchDateTime))
        throw createError.BadRequest(__.match_date_should_not_as_past_date);
      const data = await matchService.scheduleMatch({ matchDate, startTime, stadium, teams });
      res.success({ data });
    } catch (error) {
      next(error)
    }
  }
];

/**
 * scheduled match by admin
 */
const cancelMatch = async (req, res, next) => {
    try {
      const { matchId  } = req.params;
      if (!ObjectId.isValid(matchId))
        throw createError.BadRequest(__.invalid_object_id);
      const data = await matchService.cancelMatch({ matchId })
      res.success({ data });
    } catch (error) {
      next(error)
    }
};

/**
 * user can subscribe any active match
 */
const matchSubscribe = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { matchId  } = req.params;
      if (!ObjectId.isValid(matchId))
        throw createError.BadRequest(__.invalid_object_id);
      const data = await matchService.matchSubscribe({ userId, matchId })
      res.success({ data });
    } catch (error) {
      next(error)
    }
};

/**
 * user can unsubscribe to subscribed match
 */
const matchUnSubscribe = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { subscriptionId } = req.params;
      if (!ObjectId.isValid(subscriptionId))
        throw createError.BadRequest(__.invalid_object_id);
      const data = await matchService.matchUnSubscribe({ userId, subscriptionId })
      res.success({ data });
    } catch (error) {
      next(error)
    }
};

/**
 * fetch list of active matches
 */
const getMatchInfo = async (req, res, next) => {
    try {
      const data = await matchService.getMatchInfo({ })
      res.success({ data });
    } catch (error) {
      next(error)
    }
};

module.exports = {
  getDashboard,
  scheduleMatch,
  cancelMatch,
  matchSubscribe,
  matchUnSubscribe,
  getMatchInfo,
};