/* Latinopedia country dossier integration, additive only; loaded after existing inline app script. */
(function(){
 const supported = new Set(['br','ar','cl','co','pe','bo','ve','ec','py','uy','gt','sv','hn','ni','cr','pa','cu','do','ht']);
 function addDossierLink(){
   try {
     const id=(typeof state!== 'undefined' && state.country) || '';
     if(!supported.has(id))return;
     const hero=document.getElementById('countryHero');
     if(!hero || hero.querySelector('[data-external-dossier]'))return;
     const a=document.createElement('a');
     a.dataset.externalDossier=id;
     a.href='countries/'+encodeURIComponent(id)+'.html';
     a.textContent='阅读'+((typeof countries!=='undefined'&&countries.find(c=>c.id===id))||{}).name+'研究专辑 →';
     a.style.cssText='display:inline-block;margin:13px 0 8px;background:#0f3f78;color:#f5f9ff;padding:11px 16px;border-radius:8px;font-weight:750;font-size:13px;text-decoration:none';
     hero.appendChild(a);
   } catch(e){console.warn('Dossier integration:',e)}
 }
 if(typeof window.renderDetail==='function'){
    const orig=window.renderDetail;
    window.renderDetail=function(){const r=orig.apply(this,arguments);addDossierLink();return r};
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addDossierLink);
 else addDossierLink();
})();
