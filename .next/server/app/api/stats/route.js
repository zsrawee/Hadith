"use strict";(()=>{var t={};t.id=961,t.ids=[961],t.modules={399:t=>{t.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:t=>{t.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6760:(t,e,a)=>{a.r(e),a.d(e,{originalPathname:()=>f,patchFetch:()=>g,requestAsyncStorage:()=>p,routeModule:()=>u,serverHooks:()=>h,staticGenerationAsyncStorage:()=>d});var r={};a.r(r),a.d(r,{GET:()=>l});var n=a(9303),s=a(8716),c=a(670),i=a(7070),o=a(3829);async function l(){try{let t=await o.Ox.getStats();return i.NextResponse.json(t)}catch(t){return i.NextResponse.json({error:t.message},{status:500})}}let u=new n.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/stats/route",pathname:"/api/stats",filename:"route",bundlePath:"app/api/stats/route"},resolvedPagePath:"/public/Projects/Hadith/src/app/api/stats/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:p,staticGenerationAsyncStorage:d,serverHooks:h}=u,f="/api/stats/route";function g(){return(0,c.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:d})}},3829:(t,e,a)=>{a.d(e,{Ox:()=>d});let r=require("hadith");var n=a.n(r);let s=null,c=!1,i=null;async function o(){return s||(c||(c=!0,i=(async()=>{try{let t=new(n());await t.connect(),s=t,console.log("✅ Hadith DB connected")}catch(t){throw console.error("❌ DB connection failed:",t),t}finally{c=!1}})()),await i),s}async function l(t){let e=(await o()).db;if(!e)return null;try{let a=e.prepare(`
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
    `);a.bind([parseInt(t)]);let r=null;return a.step()&&(r=a.getAsObject()),a.free(),r}catch{return null}}async function u(t,e,a=30,r=0){let n=(await o()).db;if(!n)return[];let s=`%${t.replace(/'/g,"''")}%`,c=`
    SELECT 
      c0 as urn, c1 as collection_id, c2 as book_id,
      c3 as display_number, c4 as order_in_book,
      c6 as narrator_prefix, c7 as content,
      c8 as narrator_postfix, c13 as grades
    FROM hadith_content
    WHERE c7 LIKE ?
  `,i=[s];e&&(c+=" AND c1 = ?",i.push(e)),c+=" ORDER BY c1, c4 LIMIT ? OFFSET ?",i.push(a+1,r);let l=n.prepare(c);l.bind(i);let u=[];for(;l.step();)u.push(l.getAsObject());return l.free(),u.slice(0,a)}async function p(t,e,a=30,r=0){let n=(await o()).db;if(!n)return[];let s=`%${t.replace(/'/g,"''")}%`,c=`
    SELECT 
      c0 as arabic_urn, c1 as urn, c2 as collection_id,
      c3 as narrator_prefix, c4 as content,
      c5 as narrator_postfix, c7 as grades, c8 as reference
    FROM hadith_en_content
    WHERE c4 LIKE ?
  `,i=[s];e&&(c+=" AND c2 = ?",i.push(e)),c+=" ORDER BY c2, c0 LIMIT ? OFFSET ?",i.push(a+1,r);let l=n.prepare(c);l.bind(i);let u=[];for(;l.step();)u.push(l.getAsObject());return l.free(),u.slice(0,a)}let d={getDB:o,getCollections:async()=>(await o()).getCollections(),getCollection:async t=>(await o()).getCollection(t),getBooks:async t=>(await o()).getBooks(t),async getHadiths(t,e){let a=await o(),r=await a.getHadithsByCollection(t,{limit:e?.limit||20,offset:e?.offset||0,bookId:e?.bookId||null}),n=[];for(let t of r){let e=await l(t.urn);e&&n.push(e)}return{arabic:r,english:n}},async getHadithByUrn(t){let e=await o(),a=await e.getHadithByUrn(t);if(!a){let r=e.db;if(r){let e=r.prepare(`
          SELECT c0 as urn, c1 as collection_id, c2 as book_id, c3 as display_number,
                 c4 as order_in_book, c5 as chapter_id, c6 as narrator_prefix, c7 as content,
                 c8 as narrator_postfix, c13 as grades, c14 as narrators, c12 as comments
          FROM hadith_content WHERE c0 = ?
        `);e.bind([parseInt(t)]),e.step()&&(a=e.getAsObject()),e.free()}}return{arabic:a,english:await l(t)}},async getRandomHadith(t){let e=await o(),a=await e.getRandomHadith(t||null),r=null;return a&&(r=await l(a.urn)),{arabic:a,english:r}},async search(t,e,a=30){let[r,n]=await Promise.all([u(t,e,a),p(t,e,a)]);return{arabic:r,english:n,total:r.length+n.length}},async getStats(){let t=await o();return await t.getInfo()}}}};var e=require("../../../webpack-runtime.js");e.C(t);var a=t=>e(e.s=t),r=e.X(0,[276,972],()=>a(6760));module.exports=r})();