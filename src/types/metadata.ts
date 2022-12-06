import { components } from '../generated-types';

type Schemas = components['schemas'];
type Asset = Schemas['asset'];

export type GetOnchainMetadataResult = {
  onchainMetadata: Schemas['onchain_metadata_cip25'] | null;
  validCIPversion: CIPTypes;
};

export type DataVersion = 1 | 2 | null;
export type CIPVersion = 25 | 68 | null;

export type CIPTypes = 'CIP25v1' | 'CIP25v2' | 'CIP68v1' | 'CIP68v2' | null;

export type { Schemas, Asset };
