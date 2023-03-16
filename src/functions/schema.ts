import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import Ajv from 'ajv';

import nutlinkAddressTickers from '../custom-schemas/nutlink-address-tickers';
import nutlinkTicker from '../custom-schemas/nutlink-ticker';
import scriptsJsonSchema from '../custom-schemas/scripts-json';
import txsMetadata from '../custom-schemas/txs-metadata';

const ajv = new Ajv({ strict: false });
const file = fs.readFileSync(
  path.resolve(__dirname, '../../openapi.yaml'),
  'utf8',
);
const spec = YAML.parse(file);

export const getSchemaForEndpoint = (endpointName: string) => {
  if (!spec.paths[endpointName]) {
    throw Error(
      `Missing Blockfrost OpenAPI schema for endpoint "${endpointName}".`,
    );
  }

  const responses: any = { response: {} };
  const method = 'post' in spec.paths[endpointName] ? 'post' : 'get';
  for (const response of Object.keys(
    spec.paths[endpointName][method].responses,
  )) {
    // success 200
    if (response === '200') {
      const referenceOrValue =
        spec.paths[endpointName][method].responses['200'].content[
          'application/json'
        ].schema;

      // is reference -> resolve references
      if (referenceOrValue['$ref']) {
        const schemaName = referenceOrValue['$ref'].replace(
          '#/components/schemas/',
          '',
        );
        const schemaReferenceOrValue = spec.components.schemas[schemaName];

        // is nested reference
        if (
          schemaReferenceOrValue.items &&
          schemaReferenceOrValue.items['$ref']
        ) {
          const nestedSchemaName = schemaReferenceOrValue.items['$ref'].replace(
            '#/components/schemas/',
            '',
          );

          if (schemaReferenceOrValue.type) {
            responses.response[200] = {
              ...schemaReferenceOrValue,
              items: spec.components.schemas[nestedSchemaName],
            };
          } else {
            responses.response[200] = spec.components.schemas[nestedSchemaName];
          }
        } else {
          // is not nested reference
          responses.response[200] = spec.components.schemas[schemaName];
        }
      } else {
        // is not reference
        responses.response[200] = referenceOrValue;
      }

      // anyOf case
      if (referenceOrValue['anyOf']) {
        const anyOfResult: any = { anyOf: [] };

        for (const anyOfItem of referenceOrValue['anyOf']) {
          const schemaName = anyOfItem['$ref'].replace(
            '#/components/schemas/',
            '',
          );

          anyOfResult['anyOf'].push(spec.components.schemas[schemaName]);
        }

        responses.response[200] = anyOfResult;
      }

      const parameters = spec.paths[endpointName][method].parameters;

      if (parameters) {
        const queryParams = parameters.filter((i: any) => i.in === 'query');
        let queryProps: any = {};

        if (queryParams && queryParams.length > 0) {
          queryParams.forEach((param: any) => {
            delete param.schema.format;
            queryProps[param.name] = param.schema;
          });

          responses['querystring'] = {
            type: 'object',
            properties: queryProps,
          };
        }

        const pathparams = parameters.filter((i: any) => i.in === 'path');

        if (pathparams && pathparams.length > 0) {
          let pathProps: any = {};

          pathparams.forEach((param: any) => {
            delete param.schema.format;
            pathProps[param.name] = param.schema;
          });

          responses['params'] = {
            type: 'object',
            properties: pathProps,
          };
        }

        // const query = parameters.filter((i: any) => i.in === 'param');
        // let queryParams: any = {};
      }

      // custom schemas
      if (endpointName === '/txs/{hash}/metadata') {
        responses.response[200] = txsMetadata;
      }

      if (endpointName === '/nutlink/{address}/tickers/{ticker}') {
        responses.response[200] = nutlinkAddressTickers;
      }

      if (endpointName === '/nutlink/tickers/{ticker}') {
        responses.response[200] = nutlinkTicker;
      }

      if (endpointName === '/scripts/{script_hash}/json') {
        responses.response[200] = scriptsJsonSchema;
      }
    }

    // errors and others
    else {
      responses.response[response] =
        spec.components.responses[response].content['application/json'].schema;
    }
  }

  // debug
  // if (endpointName === '/blocks/{hash_or_number}') {
  //   console.log(endpointName, JSON.stringify(responses));
  // }

  return responses;
};

export const getSchema = (schemaName: string) => {
  if (!spec.components.schemas[schemaName]) {
    throw Error(`Missing Blockfrost OpenAPI schema with name "${schemaName}".`);
  }

  return spec.components.schemas[schemaName];
};

export const generateSchemas = () => {
  // Returns fast-json-stringify compatible schema object indexed by endpoint name
  const endpoints = Object.keys(spec.paths);

  const schemas: Record<string, unknown> = {};
  for (const endpoint of endpoints) {
    try {
      schemas[endpoint] = getSchemaForEndpoint(endpoint);
    } catch (error) {
      console.error(`Error while processing endpoint ${endpoint}`);
      throw error;
    }
  }
  return schemas;
};

export const validateSchema = (schemaName: string, input: unknown) => {
  const schema = getSchema(schemaName);
  const validate = ajv.compile(schema);
  const isValid = validate(input);

  return { isValid, errors: validate.errors };
};
