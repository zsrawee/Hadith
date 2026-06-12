"use strict";(()=>{var e={};e.id=252,e.ids=[252],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6731:(e,t,a)=>{a.r(t),a.d(t,{originalPathname:()=>g,patchFetch:()=>f,requestAsyncStorage:()=>p,routeModule:()=>u,serverHooks:()=>h,staticGenerationAsyncStorage:()=>d});var r={};a.r(r),a.d(r,{GET:()=>l});var n=a(9303),s=a(8716),c=a(670),i=a(7070),o=a(3829);async function l(e){try{let{searchParams:t}=new URL(e.url),a=parseInt(t.get("collection")||"1"),r=parseInt(t.get("limit")||"20"),n=parseInt(t.get("offset")||"0"),s=t.get("book")?parseInt(t.get("book")):void 0,c=await o.Ox.getHadiths(a,{limit:r,offset:n,bookId:s});return i.NextResponse.json(c)}catch(e){return i.NextResponse.json({error:e.message},{status:500})}}let u=new n.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/hadiths/route",pathname:"/api/hadiths",filename:"route",bundlePath:"app/api/hadiths/route"},resolvedPagePath:"/public/Projects/Hadith/src/app/api/hadiths/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:p,staticGenerationAsyncStorage:d,serverHooks:h}=u,g="/api/hadiths/route";function f(){return(0,c.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:d})}},3829:(e,t,a)=>{a.d(t,{Ox:()=>d});let r=require("hadith");var n=a.n(r);let s=null,c=!1,i=null;async function o(){return s||(c||(c=!0,i=(async()=>{try{let e=new(n());await e.connect(),s=e,console.log("✅ Hadith DB connected")}catch(e){throw console.error("❌ DB connection failed:",e),e}finally{c=!1}})()),await i),s}async function l(e){let t=(await o()).db;if(!t)return null;try{let a=t.prepare(`
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
    `);a.bind([parseInt(e)]);let r=null;return a.step()&&(r=a.getAsObject()),a.free(),r}catch{return null}}async function u(e,t,a=30,r=0){let n=(await o()).db;if(!n)return[];let s=`%${e.replace(/'/g,"''")}%`,c=`
    SELECT 
      c0 as urn, c1 as collection_id, c2 as book_id,
      c3 as display_number, c4 as order_in_book,
      c6 as narrator_prefix, c7 as content,
      c8 as narrator_postfix, c13 as grades
    FROM hadith_content
    WHERE c7 LIKE ?
  `,i=[s];t&&(c+=" AND c1 = ?",i.push(t)),c+=" ORDER BY c1, c4 LIMIT ? OFFSET ?",i.push(a+1,r);let l=n.prepare(c);l.bind(i);let u=[];for(;l.step();)u.push(l.getAsObject());return l.free(),u.slice(0,a)}async function p(e,t,a=30,r=0){let n=(await o()).db;if(!n)return[];let s=`%${e.replace(/'/g,"''")}%`,c=`
    SELECT 
      c0 as arabic_urn, c1 as urn, c2 as collection_id,
      c3 as narrator_prefix, c4 as content,
      c5 as narrator_postfix, c7 as grades, c8 as reference
    FROM hadith_en_content
    WHERE c4 LIKE ?
  `,i=[s];t&&(c+=" AND c2 = ?",i.push(t)),c+=" ORDER BY c2, c0 LIMIT ? OFFSET ?",i.push(a+1,r);let l=n.prepare(c);l.bind(i);let u=[];for(;l.step();)u.push(l.getAsObject());return l.free(),u.slice(0,a)}let d={getDB:o,getCollections:async()=>(await o()).getCollections(),getCollection:async e=>(await o()).getCollection(e),getBooks:async e=>(await o()).getBooks(e),async getHadiths(e,t){let a=await o(),r=await a.getHadithsByCollection(e,{limit:t?.limit||20,offset:t?.offset||0,bookId:t?.bookId||null}),n=[];for(let e of r){let t=await l(e.urn);t&&n.push(t)}return{arabic:r,english:n}},async getHadithByUrn(e){let t=await o(),a=await t.getHadithByUrn(e);if(!a){let r=t.db;if(r){let t=r.prepare(`
          SELECT c0 as urn, c1 as collection_id, c2 as book_id, c3 as display_number,
                 c4 as order_in_book, c5 as chapter_id, c6 as narrator_prefix, c7 as content,
                 c8 as narrator_postfix, c13 as grades, c14 as narrators, c12 as comments
          FROM hadith_content WHERE c0 = ?
        `);t.bind([parseInt(e)]),t.step()&&(a=t.getAsObject()),t.free()}}return{arabic:a,english:await l(e)}},async getRandomHadith(e){let t=await o(),a=await t.getRandomHadith(e||null),r=null;return a&&(r=await l(a.urn)),{arabic:a,english:r}},async search(e,t,a=30){let[r,n]=await Promise.all([u(e,t,a),p(e,t,a)]);return{arabic:r,english:n,total:r.length+n.length}},async getStats(){let e=await o();return await e.getInfo()}}}};var t=require("../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),r=t.X(0,[276,972],()=>a(6731));module.exports=r})();