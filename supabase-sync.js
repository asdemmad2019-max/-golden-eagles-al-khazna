// Golden Eagles - Supabase Sync - Connected
(function(){
  try{
    if(!window.SUPABASE_URL || window.SUPABASE_URL.indexOf('PASTE_')===0){ console.log('Golden Eagles: local mode'); return; }
    if(!window.supabase){ console.log('Supabase JS not loaded'); return; }
    var key = window.SUPABASE_ANON_KEY || window.SUPABASE_PUBLISHABLE_KEY;
    var client = window.supabase.createClient(window.SUPABASE_URL, key);
    window.geSupabase = client;
    console.log('Golden Eagles: Supabase connected to', window.SUPABASE_URL);
    var el=document.getElementById('sbStatus'); if(el) el.textContent='☁️ Supabase مربوط ✅ - البيانات بالسحابة';
    async function test(){
      try{
        var r = await client.from('plans').select('*').limit(5);
        if(r.error){ console.log('Supabase plans - table not yet created? Run supabase.sql:', r.error.message); 
          var s2=document.getElementById('sbStatus'); if(s2) s2.textContent='⚠️ Supabase مربوط لكن الجداول بعدها ما منشأة - شغّل supabase.sql في SQL Editor';
        } else { console.log('Supabase plans:', r.data); }
      }catch(e){ console.log('Supabase test:', e.message); }
    }
    test();
  }catch(e){ console.log('Supabase sync disabled:', e); }
})();
