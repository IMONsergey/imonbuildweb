import * as migration_20261020_071331_initial from './20261020_071331_initial';

export const migrations = [
  {
    up: migration_20261020_071331_initial.up,
    down: migration_20261020_071331_initial.down,
    name: '20261020_071331_initial'
  },
];
