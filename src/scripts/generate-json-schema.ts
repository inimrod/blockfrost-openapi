import * as fs from 'fs';
import * as path from 'path';
import { generateSchemas } from '../functions/schema';

const schemas: any = generateSchemas();
const specPath = path.join(__dirname, '../../openapi-json-schema.json');

fs.writeFileSync(specPath, JSON.stringify(schemas, null, 2));
