import User from './user';
import Event from './event';

// Setup associations
User.hasMany(Event, {
  foreignKey: 'createdBy',
  as: 'events',
});

Event.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator',
});

export { User, Event };
