import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requestSchema, extractionSchema } from './report.js';

test('request schema rejects blank answers and the route can apply configurable length limits',()=>{
 assert.equal(requestSchema.safeParse({answer:'   '}).success,false);
 assert.equal(requestSchema.safeParse({answer:'A useful statement.'}).success,true);
});

test('claim extraction schema rejects an unsupported category and more than twenty claims',()=>{
 const claim={originalText:'React 19 is current.',category:'software_version',entity:'React',timeSensitive:true,reason:'Versions change.',searchQuery:'official latest React release'};
 assert.equal(extractionSchema.safeParse({claims:[{...claim,category:'made_up'}]}).success,false);
 assert.equal(extractionSchema.safeParse({claims:Array.from({length:21},()=>claim)}).success,false);
});
