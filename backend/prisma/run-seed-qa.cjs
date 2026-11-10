/** Cross-platform entry for QA seed (avoids brittle ts-node CLI JSON on Windows). */
require('ts-node').register({ compilerOptions: { module: 'commonjs' } });
require('./seed.qa.ts');
