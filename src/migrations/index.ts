import * as migration_20261020_071331_initial from './20261020_071331_initial';
import * as migration_20261020_094428 from './20261020_094428';

export const migrations = [
  {
    up: migration_20261020_071331_initial.up,
    down: migration_20261020_071331_initial.down,
    name: '20261020_071331_initial',
  },
  {
    up: migration_20261020_094428.up,
    down: migration_20261020_094428.down,
    name: '20261020_094428'
  },
];
