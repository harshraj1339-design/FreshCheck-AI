import { test } from 'node:test';
import assert from 'node:assert/strict';
import { authority, scoreEvidence } from './scoring.service.js';
import type { SearchSource } from './tavily.service.js';

const source=(sourceId:string,domain:string,publishedAt:string|null=null):SearchSource=>({sourceId,title:'Source',url:`https://${domain}/page`,domain,publishedAt,score:.8,content:'Current source content'});

test('no evidence produces no invented score',()=>{
 assert.equal(scoreEvidence('product_pricing',[],new Map(),new Map()),null);
});

test('undated evidence gets reduced recency certainty, not an assumed current date',()=>{
 const result=scoreEvidence('software_version',[source('a','react.dev')],new Map([['a','supports']]),new Map([['a',85]]));
 assert.ok(result);assert.equal(result.parts.recency,50);assert.equal(result.parts.sourceAuthority,92);
});

test('independent publishers that disagree reduce agreement score',()=>{
 const sources=[source('a','react.dev','2026-10-20'),source('b','developer.mozilla.org','2026-10-22')];
 const result=scoreEvidence('software_version',sources,new Map([['a','supports'],['b','contradicts']]),new Map([['a',85],['b',85]]));
 assert.ok(result);assert.equal(result.parts.sourceAgreement,35);
});

test('authority recognizes known official and public-interest domains',()=>{
 assert.equal(authority('react.dev'),92);assert.equal(authority('docs.react.dev'),92);assert.equal(authority('reuters.com'),82);assert.equal(authority('randomblog.example'),48);
});
