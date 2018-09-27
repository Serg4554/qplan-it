'use strict';

const shortid = require('shortid');
const hashids = require('hashids');
const bcrypt = require('bcrypt');
const randtoken = require('rand-token');
const moment = require('moment');
const ErrorConst = require('../../server/middleware/error-const');
const editJsonFile = require("edit-json-file");
const config = require('../../server/config.json');
const superagentPromise = require('superagent-promise');
const _superagent = require('superagent');
const agent = superagentPromise(_superagent, Promise);
const TokenGenerator = require('uuid-token-generator');
const token = new TokenGenerator(256, TokenGenerator.BASE62);


/** @namespace model.participation */
module.exports = function(model) {
  model.validatesPresenceOf("days");

  async function generateUniqueId() {
    let uniqueId, unique = false, count = 0;

    while(!unique) {
      if(count === 5) {
        config.eventIdLength = config.eventIdLength + 1;
        let file = editJsonFile(`${__dirname}/../../server/config.json`, {});
        file.set("eventIdLength", config.eventIdLength);
        file.save();
        count = 0;
      }
      uniqueId = new hashids(shortid.generate(), config.eventIdLength).encode(1);
      await model.findById(uniqueId).then(event => unique = !event);
      count++;
    }

    return uniqueId;
  }

  async function handleCreate(ctx) {
    ensureValidDays(ctx.instance.days);

    let userId = null;
    if(ctx.options.accessToken) {
      userId = ctx.options.accessToken.userId;
    }

    await generateUniqueId()
      .then(id => {
        ctx.instance.id = id;
        ctx.instance.ownerId = userId;
        ctx.instance.claimToken = userId ? null : randtoken.generate(64);
        if(ctx.instance.password) {
          ctx.instance.password = bcrypt.hashSync(ctx.instance.password, bcrypt.genSaltSync());
        }
      });
  }

  function handleUpdate(ctx) {
    return ctx.Model.findById(ctx.instance.id)
      .then(event => {
        ensureValidDays(ctx.instance.days);

        ctx.instance.id = event.id;
        ctx.instance.ownerId = event.ownerId;
        ctx.instance.claimToken = event.claimToken;
        if(ctx.instance.password) {
          ctx.instance.password = bcrypt.hashSync(ctx.instance.password, bcrypt.genSaltSync());
        }
      });
  }

  function handlePatch(ctx) {
    return ctx.Model.findById(ctx.currentInstance.id)
      .then(event => {
        ensureValidDays(ctx.data.days);

        ctx.data.id = event.id;
        ctx.data.ownerId = event.ownerId;
        ctx.data.claimToken = event.claimToken;
        if(ctx.data.password) {
          ctx.data.password = bcrypt.hashSync(ctx.data.password, bcrypt.genSaltSync());
        }
      });
  }

  function ensureValidDays(days) {
    let startDate, endDate, dayTime, dayTimes = [];

    if(!days || days.length === 0) {
      throw ErrorConst.Error(ErrorConst.DAYS_REQUIRED);
    }

    days.forEach(day => {
      if(!day.period || !day.period.start || isNaN(day.period.start.getTime())) {
        throw ErrorConst.Error(ErrorConst.PERIOD_REQUIRED);
      }

      startDate = moment(day.period.start);
      dayTime = moment(startDate).startOf('day').toDate().getTime();

      if(!dayTimes.includes(dayTime)) {
        dayTimes.push(dayTime);
      } else {
        throw ErrorConst.Error(ErrorConst.DAYS_NOT_UNIQUE);
      }

      if(!day.period.duration || day.period.duration <= 0) {
        day.period.duration = Math.floor(moment(startDate).endOf('day').diff(startDate) / 60000) + 1;
      } else if(day.period.duration > 1440) {
        day.period.duration = 1440;
      }
      endDate = moment(startDate).add(day.period.duration, 'm');
      if(day.period.duration === 1440 && endDate.hours() === 0 && endDate.minutes() === 0) {
        endDate = moment(startDate).endOf('day');
      }

      if(day.blockedPeriods) {
        day.blockedPeriods.forEach(period => {
          if(!period.start || isNaN(period.start.getTime())) {
            throw ErrorConst.Error(ErrorConst.PERIOD_REQUIRED);
          }

          let bpStart = moment(startDate).hours(period.start.getHours()).minutes(period.start.getMinutes());
          let minutesToEnd = Math.floor(endDate.diff(bpStart) / 60000) % 1440;

          if(!period.duration || period.duration <= 0 || period.duration > minutesToEnd) {
            period.duration = minutesToEnd;
          }
        });
      }
    });
  }

  async function ensureValidParticipation(eventId, participation, validatePass) {
    if(!eventId) {
      throw ErrorConst.Error(ErrorConst.INVALID_EVENT_ID);
    }

    let event = {};
    await model.findById(eventId)
      .then(doc => {
        event = doc;
        if(!event) {
          throw ErrorConst.Error(ErrorConst.INVALID_EVENT_ID);
        }
        if(event.expiration && moment().isSameOrAfter(moment(event.expiration).startOf('day'))) {
          throw ErrorConst.Error(ErrorConst.EVENT_PARTICIPATION_EXPIRED);
        }

        if(validatePass && event.password && !bcrypt.compareSync(participation.password || "", event.password)) {
          throw ErrorConst.Error(ErrorConst.INVALID_EVENT_PASSWORD);
        }
      })
      .catch(err => {
        if(!err.code) {
          throw ErrorConst.Error(ErrorConst.INVALID_EVENT_ID)
        }
        throw err;
      });

    return event;
  }

  model.beforeRemote('create', async function (ctx) {
    let captchaData = `secret=${config.invisibleCaptchaSecret}&response=${ctx.req.body.captchaToken}`;
    await agent.post('https://www.google.com/recaptcha/api/siteverify', captchaData)
      .then(res => {
        if(!res.body.success) {
          throw ErrorConst.Error(ErrorConst.INVALID_CAPTCHA);
        }
      });
    delete ctx.req.body.captchaToken;
  });

  // Apply checks and modifications before save
  model.observe('before save', async function(ctx) {
    if(ctx.isNewInstance) {
      await handleCreate(ctx);
    } else if(ctx.instance) {
      await handleUpdate(ctx);
    } else if(ctx.currentInstance) {
      await handlePatch(ctx);
    }
  });

  // Send the claimToken when an event is created
  model.observe('after save', async function(ctx) {
    if(ctx.isNewInstance && ctx.instance.claimToken) {
      ctx.instance._claimToken = ctx.instance.claimToken;
    }
  });


  model.remoteMethod('findOwnedEvents', {
    description: 'Find all the events owned by the user.',
    accepts: [
      {arg: 'options', type: 'object', http: 'optionsFromRequest'}
    ],
    returns: { arg: 'body', type: '[event]', root: true },
    http: {verb: 'GET', path: '/'}
  });
  model.findOwnedEvents = async function(options) {
    if(!options.accessToken || !options.accessToken.userId) {
      throw ErrorConst.Error(ErrorConst.AUTHORIZATION_REQUIRED)
    }

    return await model.find({ where: { ownerId: options.accessToken.userId } })
      .then(events => {
        return events || [];
      });
  };



  model.remoteMethod('claim', {
      description: 'Allows an user to claims an event using the claimToken',
      accepts: [
        {arg: 'id', type: 'string', required: true, description: 'Model id'},
        {arg: 'userId', type: 'any', http: ctx => ctx.req.accessToken ? ctx.req.accessToken.userId : null},
        {arg: 'claimToken', type: 'string', required: true, http: {source: 'form'}, description: 'Claim token'},
      ],
      returns: { arg: 'body', type: 'string', root: true },
      http: {verb: 'POST', path: '/:id/claim'}
    }
  );
  model.claim = async function(eventId, userId, claimToken) {
    if(!userId) {
      throw ErrorConst.Error(ErrorConst.CLAIM_LOGIN_REQUIRED);
    }
    return model.findById(eventId)
      .then(event => {
        if(!event) {
          throw ErrorConst.Error(ErrorConst.EVENT_NOT_FOUND);
        }

        if(!event.claimToken || event.ownerId) {
          throw ErrorConst.Error(ErrorConst.EVENT_HAS_OWNER);
        }

        if(event.claimToken !== claimToken) {
          throw ErrorConst.Error(ErrorConst.INVALID_CLAIM);
        }

        return model.update({id: event.id}, {ownerId: userId, claimToken: null})
          .then(() => model.findById(event.id));
      });
  };


  model.remoteMethod('participation_find', {
    description: 'Find the participations of the specified event.',
    accepts: [
      {arg: 'id', type: 'string', required: true, description: 'Model id'},
      {arg: 'userId', type: 'string', required: false, http: {source: 'query'}, description: 'User id'}
    ],
    returns: { arg: 'body', type: '[participation]', root: true },
    http: {verb: 'GET', path: '/:id/participations'}
  });
  model.participation_find = async function(eventId, userId) {
    return await model.app.models.participation.find({ where: { eventId, ownerId: userId } })
      .then(participations => {
        return userId ? participations[0] || null : participations;
      });
  };


  model.remoteMethod('participation_findById', {
    description: 'Find the specified participation in the event.',
    accepts: [
      {arg: 'id', type: 'string', required: true, description: 'Model id'},
      {arg: 'part_id', type: 'string', required: true, description: 'Participation id'}
    ],
    returns: { arg: 'body', type: 'participation', root: true },
    http: {verb: 'GET', path: '/:id/participations/:part_id'}
  });
  model.participation_findById = async function(eventId, partId) {
    return await model.app.models.participation.findOne({ where: { id: partId, eventId } })
      .then(participations => {
        return participations;
      });
  };


  model.remoteMethod('participation_create', {
    description: 'Create a new participation for the event.',
    accepts: [
      {arg: 'id', type: 'string', required: true, description: 'Event id'},
      {arg: 'data', type: 'participation', http: {source: 'body'}, description: 'Participation data'},
      {arg: 'options', type: 'object', http: 'optionsFromRequest'},
    ],
    returns: { arg: 'body', type: 'participation', root: true },
    http: {verb: 'POST', path: '/:id/participations'}
  });
  model.participation_create = async function(eventId, data, options) {
    await ensureValidParticipation(eventId, data, true);

    let participation = { eventId, selections: data.selections };

    let validUser = false;
    if(options.accessToken && options.accessToken.userId) {
      await model.app.models.user.findById(options.accessToken.userId)
        .then(user => {
          if(user) {
            validUser = true;
            participation.name = user.name;
            participation.surname = user.surname;
            participation.ownerId = user.id;
          }
        })
        .catch(() => {});
    }
    if(!validUser && !data.name) {
      throw ErrorConst.Error(ErrorConst.PARTICIPATION_NAME_REQUIRED);
    } else if(!validUser) {
      participation.name = data.name;
      participation.surname = data.surname;
      participation.ownerId = null;
    }

    let lastParticipation = null;
    if(participation.ownerId) {
      await model.app.models.participation.findOne({where: { eventId: eventId, ownerId: participation.ownerId }})
        .then(participation => { if(participation) lastParticipation = participation });
    } else {
      participation.participationToken = token.generate();
    }

    if(lastParticipation) {
      return lastParticipation;
    } else {
      return await model.app.models.participation.create(participation)
        .then(participation => {
          if(participation.participationToken) {
            participation._participationToken = participation.participationToken;
          }
          return participation;
        });
    }
  };


  model.remoteMethod('participation_selection_create', {
    description: 'Create a selection for a participation.',
    accepts: [
      {arg: 'id', type: 'string', required: true, description: 'Event id'},
      {arg: 'part_id', type: 'string', required: true, description: 'Participation id'},
      {arg: 'part_token', type: 'string', required: false, http: {source: 'query'}, description: 'Participation token'},
      {arg: 'data', type: ['selection'], http: {source: 'body'}, description: 'Participation data'},
      {arg: 'options', type: 'object', http: 'optionsFromRequest'},
    ],
    returns: { arg: 'body', type: ['selection'], root: true },
    http: {verb: 'POST', path: '/:id/participations/:part_id/selections'}
  });
  model.participation_selection_create = async function(eventId, partId, partToken, data, options) {
    await ensureValidParticipation(eventId, data, false);

    let part = await model.app.models.participation.findById(partId)
      .then(participation => {
        if(!participation) {
          throw ErrorConst.Error(ErrorConst.INVALID_PARTICIPATION_ID)
        }
        return participation;
      });

    if((!part.ownerId || !options.accessToken || part.ownerId.toString() !== options.accessToken.userId.toString()) &&
      (!part.participationToken || !partToken || part.participationToken !== partToken)) {
      throw ErrorConst.Error(ErrorConst.AUTHORIZATION_REQUIRED)
    }

    part.selections = data;
    return await model.app.models.participation.upsert(part)
      .then(participation => participation.selections);
  };
};
