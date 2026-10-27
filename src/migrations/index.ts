import * as migration_20261020_071331_initial from './20261020_071331_initial';
import * as migration_20261020_094428 from './20261020_094428';
import * as migration_20261020_103516_studio_document_layout from './20261020_103516_studio_document_layout';
import * as migration_20261020_110139_about_editorial_values from './20261020_110139_about_editorial_values';
import * as migration_20261027_051821_case_editorial from './20261027_051821_case_editorial';

export const migrations = [
  {
    up: migration_20261020_071331_initial.up,
    down: migration_20261020_071331_initial.down,
    name: '20261020_071331_initial',
  },
  {
    up: migration_20261020_094428.up,
    down: migration_20261020_094428.down,
    name: '20261020_094428',
  },
  {
    up: migration_20261020_103516_studio_document_layout.up,
    down: migration_20261020_103516_studio_document_layout.down,
    name: '20261020_103516_studio_document_layout',
  },
  {
    up: migration_20261020_110139_about_editorial_values.up,
    down: migration_20261020_110139_about_editorial_values.down,
    name: '20261020_110139_about_editorial_values',
  },
  {
    up: migration_20261027_051821_case_editorial.up,
    down: migration_20261027_051821_case_editorial.down,
    name: '20261027_051821_case_editorial'
  },
];
