import User from './user';
import Event from './event';
import EventParticipant from './eventParticipant';

// Setup associations
User.hasMany(Event, {
  foreignKey: 'createdBy',
  as: 'events',
});

Event.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator',
});

// EventParticipant associations
EventParticipant.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

EventParticipant.belongsTo(Event, {
  foreignKey: 'eventId',
  as: 'event',
});

User.hasMany(EventParticipant, {
  foreignKey: 'userId',
  as: 'participations',
});

Event.hasMany(EventParticipant, {
  foreignKey: 'eventId',
  as: 'participations',
});

// Many-to-many associations
User.belongsToMany(Event, {
  through: EventParticipant,
  foreignKey: 'userId',
  otherKey: 'eventId',
  as: 'participatedEvents',
});

Event.belongsToMany(User, {
  through: EventParticipant,
  foreignKey: 'eventId',
  otherKey: 'userId',
  as: 'participants',
});

export { User, Event, EventParticipant };
