const jsonBuffer = require('./index.js');

// Benchmark configuration
const ITERATIONS = 100000;

// Test data
const testCases = {
  smallBuffer: Buffer.from('small data'),
  largeBuffer: Buffer.from('x'.repeat(1000)),
  simpleObject: { foo: 'bar', baz: 123, qux: true },
  complexObject: {
    string: 'hello world',
    number: 12345,
    boolean: true,
    null: null,
    buffer: Buffer.from('binary data'),
    nested: {
      array: [1, 2, 3, 'four', Buffer.from('nested buffer')],
      object: { key: 'value' }
    }
  },
  bufferArray: [Buffer.from('a'), Buffer.from('b'), Buffer.from('c')],
  primitives: {
    str: 'test',
    num: 42,
    bool: false,
    nil: null
  },
  escapeStrings: {
    normal: 'normal string',
    colonPrefix: ':prefixed',
    base64Like: ':base64:fake'
  }
};

function benchmark(name, fn) {
  const start = process.hrtime.bigint();
  for (let i = 0; i < ITERATIONS; i++) {
    fn();
  }
  const end = process.hrtime.bigint();
  const duration = Number(end - start) / 1000000; // Convert to milliseconds
  const opsPerSec = Math.round((ITERATIONS / duration) * 1000);
  return { duration, opsPerSec };
}

console.log('JSON Buffer Performance Benchmark');
console.log('='.repeat(60));
console.log(`Iterations: ${ITERATIONS.toLocaleString()}\n`);

const results = {};

// Run benchmarks
for (const [name, data] of Object.entries(testCases)) {
  console.log(`Testing: ${name}`);

  // Stringify benchmark
  const stringifyResult = benchmark(`${name}_stringify`, () => {
    jsonBuffer.stringify(data);
  });
  console.log(`  stringify: ${stringifyResult.duration.toFixed(2)}ms (${stringifyResult.opsPerSec.toLocaleString()} ops/sec)`);

  // Parse benchmark
  const stringified = jsonBuffer.stringify(data);
  const parseResult = benchmark(`${name}_parse`, () => {
    jsonBuffer.parse(stringified);
  });
  console.log(`  parse:     ${parseResult.duration.toFixed(2)}ms (${parseResult.opsPerSec.toLocaleString()} ops/sec)`);

  // Round-trip benchmark
  const roundTripResult = benchmark(`${name}_roundtrip`, () => {
    jsonBuffer.parse(jsonBuffer.stringify(data));
  });
  console.log(`  roundtrip: ${roundTripResult.duration.toFixed(2)}ms (${roundTripResult.opsPerSec.toLocaleString()} ops/sec)`);

  results[name] = {
    stringify: stringifyResult,
    parse: parseResult,
    roundtrip: roundTripResult
  };

  console.log();
}

// Summary
console.log('='.repeat(60));
console.log('Summary:');
console.log('='.repeat(60));

let totalStringifyTime = 0;
let totalParseTime = 0;
let totalRoundTripTime = 0;

for (const [name, result] of Object.entries(results)) {
  totalStringifyTime += result.stringify.duration;
  totalParseTime += result.parse.duration;
  totalRoundTripTime += result.roundtrip.duration;
}

console.log(`Total stringify time: ${totalStringifyTime.toFixed(2)}ms`);
console.log(`Total parse time:     ${totalParseTime.toFixed(2)}ms`);
console.log(`Total roundtrip time: ${totalRoundTripTime.toFixed(2)}ms`);
console.log(`\nAverage ops/sec (stringify): ${Math.round((ITERATIONS * Object.keys(testCases).length / totalStringifyTime) * 1000).toLocaleString()}`);
console.log(`Average ops/sec (parse):     ${Math.round((ITERATIONS * Object.keys(testCases).length / totalParseTime) * 1000).toLocaleString()}`);
console.log(`Average ops/sec (roundtrip): ${Math.round((ITERATIONS * Object.keys(testCases).length / totalRoundTripTime) * 1000).toLocaleString()}`);

// Performance characteristics
console.log('\n' + '='.repeat(60));
console.log('Optimization Summary:');
console.log('='.repeat(60));
console.log('✓ Cached regex patterns to avoid recompilation');
console.log('✓ Optimized buffer detection with early type checks');
console.log('✓ Fast paths for primitive types (number, boolean, null)');
console.log('✓ Reduced string allocations using array join');
console.log('✓ Optimized string prefix checks using charCodeAt');
console.log('✓ Early exit paths in parse reviver function');
console.log('✓ Cached constant strings to reduce allocations');
