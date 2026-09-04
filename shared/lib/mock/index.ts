/**
 * The mock data layer. Both apps import from here and nowhere else, so the
 * student app and the admin panel can never disagree about the dataset.
 *
 * When this becomes real, each of these becomes a server load. The shapes are
 * already the shapes the routes want.
 */
export * from './constants';
export * from './users';
export * from './sessions';
export * from './reviews';
export * from './karma';
export * from './perks';
export * from './store';
export * from './matches';
export * from './mesh';
export * from './badges';
export * from './messages';
export * from './notifications';
export * from './reports';
export * from './analytics';
