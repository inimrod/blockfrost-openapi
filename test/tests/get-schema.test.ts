import { expect, describe, test } from 'vitest';
import { getSchema } from '../../src/index';
import { transformSchemaElement } from '../../src/functions/schema';
import * as fixtures from '../fixtures/schema';

describe('getSchema', () => {
  test('health schema - no refs', () => {
    expect(getSchema('block_content')).toStrictEqual({
      type: 'object',
      properties: {
        time: {
          type: 'integer',
          example: 1641338934,
          description: 'Block creation time in UNIX time',
        },
        height: {
          type: 'integer',
          nullable: true,
          example: 15243593,
          description: 'Block number',
        },
        hash: {
          type: 'string',
          example:
            '4ea1ba291e8eef538635a53e59fddba7810d1679631cc3aed7c8e6c4091a516a',
          description: 'Hash of the block',
        },
        slot: {
          type: 'integer',
          nullable: true,
          example: 412162133,
          description: 'Slot number',
        },
        epoch: {
          type: 'integer',
          nullable: true,
          example: 425,
          description: 'Epoch number',
        },
        epoch_slot: {
          type: 'integer',
          nullable: true,
          example: 12,
          description: 'Slot within the epoch',
        },
        slot_leader: {
          type: 'string',
          example: 'pool1pu5jlj4q9w9jlxeu370a3c9myx47md5j5m2str0naunn2qnikdy',
          description:
            'Bech32 ID of the slot leader or specific block description in case there is no slot leader',
        },
        size: {
          type: 'integer',
          example: 3,
          description: 'Block size in Bytes',
        },
        tx_count: {
          type: 'integer',
          example: 1,
          description: 'Number of transactions in the block',
        },
        output: {
          type: 'string',
          nullable: true,
          example: '128314491794',
          description: 'Total output within the block in Lovelaces',
        },
        fees: {
          type: 'string',
          nullable: true,
          example: '592661',
          description: 'Total fees within the block in Lovelaces',
        },
        block_vrf: {
          type: 'string',
          nullable: true,
          example:
            'vrf_vk1wf2k6lhujezqcfe00l6zetxpnmh9n6mwhpmhm0dvfh3fxgmdnrfqkms8ty',
          description: 'VRF key of the block',
          minLength: 65,
          maxLength: 65,
        },
        op_cert: {
          type: 'string',
          nullable: true,
          example:
            'da905277534faf75dae41732650568af545134ee08a3c0392dbefc8096ae177c',
          description:
            'The hash of the operational certificate of the block producer',
        },
        op_cert_counter: {
          type: 'string',
          nullable: true,
          example: '18',
          description:
            'The value of the counter used to produce the operational certificate',
        },
        previous_block: {
          type: 'string',
          nullable: true,
          example:
            '43ebccb3ac72c7cebd0d9b755a4b08412c9f5dcb81b8a0ad1e3c197d29d47b05',
          description: 'Hash of the previous block',
        },
        next_block: {
          type: 'string',
          nullable: true,
          example:
            '8367f026cf4b03e116ff8ee5daf149b55ba5a6ec6dec04803b8dc317721d15fa',
          description: 'Hash of the next block',
        },
        confirmations: {
          type: 'integer',
          example: 4698,
          description: 'Number of block confirmations',
        },
      },
      required: [
        'time',
        'height',
        'hash',
        'slot',
        'epoch',
        'epoch_slot',
        'slot_leader',
        'size',
        'tx_count',
        'output',
        'fees',
        'block_vrf',
        'op_cert',
        'op_cert_counter',
        'previous_block',
        'next_block',
        'confirmations',
      ],
    });

    expect(getSchema('tx_content_stake_addr')).toStrictEqual({
      type: 'array',
      items: {
        type: 'object',
        properties: {
          cert_index: {
            type: 'integer',
            example: 0,
            description: 'Index of the certificate within the transaction',
          },
          address: {
            type: 'string',
            example:
              'stake1u9t3a0tcwune5xrnfjg4q7cpvjlgx9lcv0cuqf5mhfjwrvcwrulda',
            description: 'Delegation stake address',
          },
          registration: {
            type: 'boolean',
            example: true,
            description: 'Registration boolean, false if deregistration',
          },
        },
        required: ['cert_index', 'address', 'registration'],
      },
    });
  });

});
