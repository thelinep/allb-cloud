import {consumeBatch,dispatchOutbox} from './jobs.mjs';
// Qualification worker: no user-facing API until native identity is integrated.
export default {
 async fetch(){return Response.json({status:'qualification-only',productionReady:false},{status:503,headers:{'Cache-Control':'no-store'}});},
 async queue(batch,env){if(!env.DB)throw Error('D1_BINDING_REQUIRED');await consumeBatch(batch,env);},
 async scheduled(_event,env){if(!env.DB||!env.JOBS)throw Error('QUEUE_BINDINGS_REQUIRED');await dispatchOutbox(env.DB,env.JOBS);}
};
