"use strict";(()=>{var e={};e.id=229,e.ids=[229],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6662:(e,t,a)=>{a.r(t),a.d(t,{originalPathname:()=>f,patchFetch:()=>g,requestAsyncStorage:()=>d,routeModule:()=>u,serverHooks:()=>h,staticGenerationAsyncStorage:()=>p});var r={};a.r(r),a.d(r,{GET:()=>l});var n=a(9303),s=a(8716),c=a(670),o=a(7070),i=a(3829);async function l(e){try{let{searchParams:t}=new URL(e.url),a=t.get("collection")?parseInt(t.get("collection")):void 0,r=await i.Ox.getRandomHadith(a);if(!r.arabic)return o.NextResponse.json({error:"Not found"},{status:404});return o.NextResponse.json(r)}catch(e){return o.NextResponse.json({error:e.message},{status:500})}}let u=new n.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/random/route",pathname:"/api/random",filename:"route",bundlePath:"app/api/random/route"},resolvedPagePath:"/public/Projects/Hadith/src/app/api/random/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:d,staticGenerationAsyncStorage:p,serverHooks:h}=u,f="/api/random/route";function g(){return(0,c.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:p})}},3829:(e,t,a)=>{a.d(t,{Ox:()=>p});let r=require("hadith");var n=a.n(r);let s=null,c=!1,o=null;async function i(){return s||(c||(c=!0,o=(async()=>{try{let e=new(n());await e.connect(),s=e,console.log("✅ Hadith DB connected")}catch(e){throw console.error("❌ DB connection failed:",e),e}finally{c=!1}})()),await o),s}async function l(e){let t=(await i()).db;if(!t)return null;try{let a=t.prepare(`
      SELECT 
        c0 as arabic_urn,
        c1 as urn,
        c2 as collection_id,
        c3 as narrator_prefix,
        c4 as content,
        c5 as narrator_postfix,
        c6 as comments,
        c7 as grades,
        c8 as reference
      FROM hadith_en_content 
      WHERE c0 = ?
    `);a.bind([parseInt(e)]);let r=null;return a.step()&&(r=a.getAsObject()),a.free(),r}catch{return null}}async function u(e,t,a=30,r=0){let n=(await i()).db;if(!n)return[];let s=`%${e.replace(/'/g,"''")}%`,c=`
    SELECT 
      c0 as urn, c1 as collection_id, c2 as book_id,
      c3 as display_number, c4 as order_in_book,
      c6 as narrator_prefix, c7 as content,
      c8 as narrator_postfix, c13 as grades
    FROM hadith_content
    WHERE c7 LIKE ?
  `,o=[s];t&&(c+=" AND c1 = ?",o.push(t)),c+=" ORDER BY c1, c4 LIMIT ? OFFSET ?",o.push(a+1,r);let l=n.prepare(c);l.bind(o);let u=[];for(;l.step();)u.push(l.getAsObject());return l.free(),u.slice(0,a)}async function d(e,t,a=30,r=0){let n=(await i()).db;if(!n)return[];let s=`%${e.replace(/'/g,"''")}%`,c=`
    SELECT 
      c0 as arabic_urn, c1 as urn, c2 as collection_id,
      c3 as narrator_prefix, c4 as content,
      c5 as narrator_postfix, c7 as grades, c8 as reference
    FROM hadith_en_content
    WHERE c4 LIKE ?
  `,o=[s];t&&(c+=" AND c2 = ?",o.push(t)),c+=" ORDER BY c2, c0 LIMIT ? OFFSET ?",o.push(a+1,r);let l=n.prepare(c);l.bind(o);let u=[];for(;l.step();)u.push(l.getAsObject());return l.free(),u.slice(0,a)}let p={getDB:i,getCollections:async()=>(await i()).getCollections(),getCollection:async e=>(await i()).getCollection(e),getBooks:async e=>(await i()).getBooks(e),async getHadiths(e,t){let a=await i(),r=await a.getHadithsByCollection(e,{limit:t?.limit||20,offset:t?.offset||0,bookId:t?.bookId||null}),n=[];for(let e of r){let t=await l(e.urn);t&&n.push(t)}return{arabic:r,english:n}},async getHadithByUrn(e){let t=await i(),a=await t.getHadithByUrn(e);if(!a){let r=t.db;if(r){let t=r.prepare(`
          SELECT c0 as urn, c1 as collection_id, c2 as book_id, c3 as display_number,
                 c4 as order_in_book, c5 as chapter_id, c6 as narrator_prefix, c7 as content,
                 c8 as narrator_postfix, c13 as grades, c14 as narrators, c12 as comments
          FROM hadith_content WHERE c0 = ?
        `);t.bind([parseInt(e)]),t.step()&&(a=t.getAsObject()),t.free()}}return{arabic:a,english:await l(e)}},async getRandomHadith(e){let t=await i(),a=await t.getRandomHadith(e||null),r=null;return a&&(r=await l(a.urn)),{arabic:a,english:r}},async search(e,t,a=30){let[r,n]=await Promise.all([u(e,t,a),d(e,t,a)]);return{arabic:r,english:n,total:r.length+n.length}},async getStats(){let e=await i();return await e.getInfo()}}}};var t=require("../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),r=t.X(0,[276,972],()=>a(6662));module.exports=r})();