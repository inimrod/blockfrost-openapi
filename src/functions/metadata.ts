import { validateSchema } from '../index';
import {
  CIPTypes,
  GetOnchainMetadataResult,
  Asset,
  CIPVersion,
  DataVersion,
} from '../types/metadata';

export const getCIPstandard = (
  dataVersion: DataVersion,
  CIPVersion: CIPVersion,
): CIPTypes => {
  if (!dataVersion) return null;

  if (CIPVersion) {
    return `CIP${CIPVersion}v${dataVersion}`;
  }

  return null;
};

export const getOnchainMetadataVersion = (
  onchainMetadata: Asset['onchain_metadata'],
): DataVersion => {
  if (!onchainMetadata?.version) {
    return 1;
  }

  if (Number(onchainMetadata.version) === 2) {
    return 2;
  }

  return null;
};

export const getOnchainMetadata = (
  onchainMetadata: Asset['onchain_metadata'],
  assetName: Asset['asset_name'],
  policyId: Asset['policy_id'],
): GetOnchainMetadataResult => {
  let internalOnchainMetada: any = onchainMetadata;

  if (!internalOnchainMetada)
    return {
      onchainMetadata: null,
      validCIPversion: null,
    };

  let isFound = false;
  let onchainMetadataResult = null;
  let validCIPversion: CIPTypes = null;
  const version = getOnchainMetadataVersion(onchainMetadata);
  const assetNameBase = assetName || '';
  const assetNameVersion1 = Buffer.from(assetNameBase || '', 'hex').toString(
    'utf8',
  );
  const assetNameVersion2 = assetNameBase;

  if (version === 1) {
    try {
      onchainMetadataResult =
        internalOnchainMetada[policyId][assetNameVersion1] || null;
      isFound = true;
    } catch (error) {
      onchainMetadataResult = null;
    }
  }

  if (version === 2) {
    try {
      const foundMetadata =
        internalOnchainMetada[policyId][assetNameVersion2] || null;
      if (foundMetadata) {
        onchainMetadataResult = foundMetadata;
        isFound = true;
      } else {
        // fallback
        onchainMetadataResult =
          internalOnchainMetada[policyId][assetNameVersion1] || null;
        isFound = false;
      }
    } catch (error) {
      onchainMetadataResult = null;
    }
  }

  const cip25Result = validateSchema(
    'asset_onchain_metadata_cip25',
    onchainMetadataResult,
  );

  const cip68Result = validateSchema(
    'asset_onchain_metadata_cip68',
    onchainMetadataResult,
  );

  let validCIPVersion: CIPVersion = null;

  if (cip25Result.isValid) {
    validCIPVersion = 25;
  }

  if (cip68Result.isValid) {
    validCIPVersion = 68;
  }

  const CIPVersion = getCIPstandard(version, isFound ? validCIPVersion : null);

  validCIPversion = CIPVersion;

  return {
    onchainMetadata: onchainMetadataResult,
    validCIPversion,
  };
};
