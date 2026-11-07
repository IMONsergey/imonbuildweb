import * as initial from './20261020_071331_initial'
import * as receipts from './20261107_114000_inquiry_receipts'

export const migrations = [
  { up: initial.up, down: initial.down, name: '20261020_071331_initial' },
  { up: receipts.up, down: receipts.down, name: '20261107_114000_inquiry_receipts' },
]
