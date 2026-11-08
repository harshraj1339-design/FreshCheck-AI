import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { requestSchema } from './schemas/report.js';
import { analyzeAnswer } from './services/analyze.service.js';
import { bifrostReadiness } from './services/bifrost.service.js';

const app=express();
app.disable('x-powered-by');app.use(cors({origin:env.clientOrigin}));app.use(express.json({limit:'64kb'}));app.use('/api',rateLimit({windowMs:60_000,limit:20,standardHeaders:true,legacyHeaders:false}));
app.get('/api/health',(_req,res)=>res.json({status:'healthy',timestamp:new Date().toISOString()}));
app.get('/api/config/status',async(_req,res)=>{const bifrost=await bifrostReadiness();return res.json({tavilyConfigured:Boolean(env.tavilyApiKey),bifrostReachable:bifrost.reachable,modelConfigured:bifrost.modelConfigured})});
app.post('/api/analyze',async(req,res)=>{const parsed=requestSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:{code:'INVALID_REQUEST',message:parsed.error.issues[0]?.message??'Invalid request'}});if(parsed.data.answer.length>env.maxInputCharacters)return res.status(413).json({error:{code:'INPUT_TOO_LARGE',message:`Answer exceeds the ${env.maxInputCharacters} character limit.`}});if(!env.tavilyApiKey)return res.status(503).json({error:{code:'TAVILY_NOT_CONFIGURED',message:'Live verification is unavailable until TAVILY_API_KEY is configured on the backend.'}});if(!env.bifrostModel)return res.status(503).json({error:{code:'BIFROST_NOT_CONFIGURED',message:'AI analysis is unavailable until BIFROST_MODEL is configured on the backend.'}});try{const report=await analyzeAnswer(parsed.data.answer);return res.json(report)}catch(error){const e=error as Error&{statusCode?:number};const status=e.statusCode??502;console.error('Analysis failed:',e.message);return res.status(status).json({error:{code:'ANALYSIS_FAILED',message:env.nodeEnv==='production'?'Verification could not be completed. Please retry later.':`Verification could not be completed: ${e.message}`}})}});
app.use((_req,res)=>res.status(404).json({error:{code:'NOT_FOUND',message:'Endpoint not found'}}));
export default app;
