(() => {
  'use strict';
  const M=window.ADCModel, $=id=>document.getElementById(id);
  const fmt=(value,digits=3)=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:digits}).format(value);
  const fixed=(value,digits=2)=>new Intl.NumberFormat('de-DE',{minimumFractionDigits:digits,maximumFractionDigits:digits}).format(value);
  const svgText=(x,y,text,extra='')=>`<text x="${x}" y="${y}" ${extra}>${text}</text>`;
  const line=(x1,y1,x2,y2,cls)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`;
  function codePlot(a,label) {
    const first=a.levels<=16?0:Math.max(0,Math.min(a.code-3,a.levels-7));
    const end=a.levels<=16?a.levels:first+7;
    const min=first*a.step,max=end*a.step,x=u=>65+(u-min)/(max-min)*630;
    const y=d=>258-(d-first)/(end-first)*180;
    let s=`<svg class="plot" viewBox="0 0 750 325" role="img" aria-label="${label}"><title>${label}</title>`;
    s+=`<rect x="${x(a.lower)}" y="65" width="${x(a.upper)-x(a.lower)}" height="205" class="active-band"/>`;
    for(let d=first;d<=end;d++){
      s+=line(x(d*a.step),65,x(d*a.step),270,'grid');
      if((end-first)<=8 || d%2===0 || d===end) s+=svgText(x(d*a.step),290,fmt(d*a.step,4),'text-anchor="middle"');
      if(d<end){
        if(end-first<=8 || d%2===0) s+=svgText(53,y(d)+5,d,'text-anchor="end"');
        s+=line(x(d*a.step),y(d),x((d+1)*a.step),y(d),'trace');
        s+=`<circle cx="${x(d*a.step)}" cy="${y(d)}" r="3" fill="#005a9e"/>`;
        s+=`<circle cx="${x((d+1)*a.step)}" cy="${y(d)}" r="3" fill="${d===a.max?'#005a9e':'white'}" stroke="#005a9e" stroke-width="1.5"/>`;
        if(d+1<end) s+=line(x((d+1)*a.step),y(d),x((d+1)*a.step),y(d+1),'transition');
      }
    }
    s+=line(65,270,710,270,'axis')+line(65,270,65,57,'axis');
    s+=svgText(65,30,'Digitalwert D')+svgText(710,317,'Eingangsspannung Uₑ / V','text-anchor="end"');
    s+=line(x(a.voltage),270,x(a.voltage),y(a.code),'current')+`<circle cx="${x(a.voltage)}" cy="${y(a.code)}" r="6" class="sample"/>`;
    s+=svgText(700,30,a.levels>16?`Ausschnitt: Codes ${first} bis ${end-1}`:`${a.levels} gleich breite Intervalle`,'text-anchor="end"');
    return s+'</svg>';
  }
  const result=(title,value,note)=>`<div class="result"><span>${title}</span><b>${value}</b><small>${note}</small></div>`;
  let qValue=1.6,pinned=null;
  function renderQ() {
    const a=M.adc(qValue,2,5);
    $('q-display').textContent=fixed(qValue)+' V'; $('q-voltage').textContent=fixed(qValue)+' V';
    $('q-code').textContent='D = '+a.code;
    $('q-bits').innerHTML=[...a.binary].map(b=>`<span class="bit ${b==='1'?'on':''}">${b}</span>`).join('');
    $('q-bits').setAttribute('aria-label','Binärcode '+a.binary);
    $('q-chart').innerHTML=codePlot(a,`2-Bit-Kennlinie: ${fixed(qValue)} Volt ergeben Code ${a.code}`);
    $('q-status').textContent=`${fixed(a.lower)} V ≤ Uₑ ${a.code===3?'≤':'<'} ${fixed(a.upper)} V → D = ${a.code}, binär ${a.binary}.`;
    $('q-comparison').className='comparison';
    if(pinned!==null){
      const old=M.adc(pinned,2,5),same=old.code===a.code;
      $('q-comparison').classList.add(same?'same':'changed');
      $('q-comparison').textContent=`Gemerkter Wert: ${fixed(pinned)} V → D = ${old.code}. Aktuell: ${fixed(qValue)} V → D = ${a.code}. ${same?'Gleicher Code: Beide Werte liegen im selben Intervall.':'Unterschiedliche Codes: Die Werte liegen in verschiedenen Intervallen.'}`;
    }else $('q-comparison').textContent='Merken Sie einen Wert und verändern Sie anschließend die Spannung.';
  }
  function setQ(value) {
    if(!Number.isFinite(value)||value<0||value>5){$('q-error').hidden=false;$('q-error').textContent='Bitte eine Spannung von 0 bis 5 V eingeben. Die Darstellung zeigt den letzten gültigen Wert.';return;}
    $('q-error').hidden=true;qValue=value;$('q-slider').value=value;$('q-input').value=value;renderQ();
  }
  $('q-slider').addEventListener('input',e=>setQ(e.target.valueAsNumber));
  $('q-input').addEventListener('input',e=>setQ(e.target.valueAsNumber));
  document.querySelectorAll('[data-voltage]').forEach(b=>b.addEventListener('click',()=>setQ(Number(b.dataset.voltage))));
  $('q-pin').addEventListener('click',()=>{pinned=qValue;renderQ();});
  $('q-reset').addEventListener('click',()=>{pinned=null;setQ(1.6);});

  function renderR() {
    const bits=Number($('r-bits').value),ref=Number($('r-ref').value),u=$('r-input').valueAsNumber;
    $('r-input').max=ref;
    if(!Number.isFinite(u)||u<0||u>ref){
      $('r-error').hidden=false;$('r-error').textContent=`Bitte Uₑ zwischen 0 und ${fmt(ref)} V eingeben. Außerhalb des Bereichs gibt es in diesem Modell keine Zuordnung.`;
      $('r-results').innerHTML='';$('r-chart').innerHTML='';$('r-status').textContent='Kein gültiger Eingangswert.';
    }else{
      $('r-error').hidden=true;const a=M.adc(u,bits,ref);
      $('r-results').innerHTML=result('Anzahl der Codes',a.levels,'N = 2ⁿ')+result('Größter Code',a.max,'Dmax = N − 1')+result('Schrittweite ΔU',fmt(a.step,8)+' V',fmt(a.step*1000,4)+' mV')+result('Aktueller Digitalwert','D = '+a.code,'Binär: '+a.binary);
      $('r-chart').innerHTML=codePlot(a,`${bits}-Bit-Kennlinie: ${fmt(u)} Volt ergeben Code ${a.code}`);
      $('r-status').textContent=`${fmt(a.lower,6)} V ≤ Uₑ ${a.code===a.max?'≤':'<'} ${fmt(a.upper,6)} V. ${bits} Bit ergeben ${a.levels} Codes, nummeriert von 0 bis ${a.max}.`;
    }
    $('r-caption').textContent='Vergleich bei Uref = '+fmt(ref)+' V';
    $('r-table').innerHTML=[2,3,4,8].map(n=>{const a=M.adc(0,n,ref);return `<tr class="${n===bits?'selected-row':''}"><td>${n}</td><td>${a.levels}</td><td>${a.max}</td><td>${fmt(a.step,8)} V</td></tr>`;}).join('');
  }
  ['r-bits','r-ref'].forEach(id=>$(id).addEventListener('change',renderR));
  $('r-input').addEventListener('input',renderR);
  $('r-reset').addEventListener('click',()=>{$('r-bits').value='4';$('r-ref').value='5';$('r-input').value='2.2';renderR();});

  let sampleCount=0,timer=null;
  const sampleModel=()=>M.sampling(Number($('s-period').value),Number($('s-interval').value));
  function stop() {if(timer!==null)window.clearInterval(timer);timer=null;$('s-play').textContent='Automatisch erfassen';$('s-play').setAttribute('aria-pressed','false');}
  function samplingPlot(m) {
    const x=t=>65+t/8*630,y=u=>280-u*53;
    let s='<svg class="plot" viewBox="0 0 750 335" role="img" aria-label="Analoger Signalverlauf und einzeln erfasste Abtastpunkte"><title>Signalperiode und Abtastintervall</title>';
    for(let t=0;t<=8;t++){s+=line(x(t),100,x(t),280,'grid')+svgText(x(t),302,t,'text-anchor="middle"');}
    for(let u=0;u<=3;u++){s+=line(65,y(u),695,y(u),'grid')+svgText(52,y(u)+5,u,'text-anchor="end"');}
    s+=line(65,280,710,280,'axis')+line(65,280,65,95,'axis')+svgText(65,85,'Uₑ / V')+svgText(710,328,'Zeit t / ms','text-anchor="end"');
    const path=Array.from({length:321},(_,i)=>{const t=i/40;return `${i?'L':'M'}${x(t).toFixed(2)},${y(M.signal(t,m.periodMs)).toFixed(2)}`;}).join(' ');
    s+=`<path d="${path}" class="trace"/>`;
    s+=line(x(0),24,x(m.periodMs),24,'period')+line(x(0),18,x(0),30,'period')+line(x(m.periodMs),18,x(m.periodMs),30,'period');
    s+=svgText(x(m.periodMs/2),17,`T = ${fmt(m.periodMs)} ms · eine Signalperiode`,'text-anchor="middle" class="period-text"');
    s+=line(x(0),56,x(m.intervalMs),56,'interval')+line(x(0),50,x(0),62,'interval')+line(x(m.intervalMs),50,x(m.intervalMs),62,'interval');
    s+=svgText(x(m.intervalMs)+12,61,`Tₐ = ${fmt(m.intervalMs)} ms · ein Abtastintervall`,'class="interval-text"');
    m.points.slice(0,sampleCount).forEach(p=>{s+=line(x(p.t),280,x(p.t),y(p.u),'transition')+`<circle cx="${x(p.t)}" cy="${y(p.u)}" r="5" class="sample"/>`;});
    if(sampleCount){const p=m.points[sampleCount-1];s+=line(x(p.t),105,x(p.t),280,'cursor');}
    return s+'</svg>';
  }
  function renderS() {
    const m=sampleModel();sampleCount=Math.min(sampleCount,m.points.length);
    $('s-results').innerHTML=result('Signalperiode T',fmt(m.periodMs)+' ms','Eine vollständige Wiederholung')+result('Signalfrequenz f',fmt(m.frequency)+' Hz','f = 1 / T, mit T in Sekunden')+result('Abtastintervall Tₐ',fmt(m.intervalMs)+' ms','Zwischen zwei Erfassungen')+result('Abtastfrequenz fₐ',fmt(m.sampleFrequency)+' Hz','fₐ = 1 / Tₐ, mit Tₐ in Sekunden');
    $('s-chart').innerHTML=samplingPlot(m);
    $('s-step').disabled=sampleCount===m.points.length;$('s-all').disabled=sampleCount===m.points.length;$('s-play').disabled=sampleCount===m.points.length;
    $('s-time-row').innerHTML='<th scope="row">t / ms</th>'+m.points.map(p=>`<th scope="col">${fmt(p.t)}</th>`).join('');
    $('s-value-row').innerHTML='<th scope="row">Uₑ / V</th>'+m.points.map((p,i)=>`<td>${i<sampleCount?fmt(p.u,3):'—'}</td>`).join('');
    if(!sampleCount)$('s-status').textContent='Noch kein Wert erfasst. Beginnen Sie bei t = 0 ms.';
    else {const p=m.points[sampleCount-1];$('s-status').textContent=`${sampleCount} von ${m.points.length} Punkten erfasst. Zuletzt: t = ${fmt(p.t)} ms, Uₑ = ${fmt(p.u,3)} V. ${sampleCount===m.points.length?`Eine Signalperiode enthält ${fmt(m.intervalsPerPeriod)} Abtastintervalle.`:''}`;}
  }
  function nextSample(){if(sampleCount<sampleModel().points.length)sampleCount++;if(sampleCount===sampleModel().points.length)stop();renderS();}
  $('s-step').addEventListener('click',nextSample);
  $('s-play').addEventListener('click',()=>{if(timer!==null){stop();return;}$('s-play').textContent='Pause';$('s-play').setAttribute('aria-pressed','true');timer=window.setInterval(nextSample,420);});
  $('s-all').addEventListener('click',()=>{stop();sampleCount=sampleModel().points.length;renderS();});
  $('s-clear').addEventListener('click',()=>{stop();sampleCount=0;renderS();});
  ['s-period','s-interval'].forEach(id=>$(id).addEventListener('change',()=>{stop();sampleCount=0;renderS();}));
  $('s-reset').addEventListener('click',()=>{stop();sampleCount=0;$('s-period').value='4';$('s-interval').value='1';renderS();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});

  const questions=[
    {title:'Ein 3-Bit-ADC hat …',answers:['3 Codes, größter Code 2.','8 Codes, größter Code 7.','8 Codes, größter Code 8.'],correct:1,why:'2³ = 8 Codes. Die Nummerierung beginnt bei 0 und endet bei 7.'},
    {title:'Bei 4 Bit und Uref = 4 V beträgt die Schrittweite …',answers:['1 V.','0,25 V.','0,4 V.'],correct:1,why:'ΔU = 4 V / 2⁴ = 4 V / 16 = 0,25 V.'},
    {title:'Ein Signal mit T = 8 ms wird alle 1 ms erfasst. Es gilt …',answers:['f = 1000 Hz und fₐ = 125 Hz.','f = fₐ = 1000 Hz.','f = 125 Hz und fₐ = 1000 Hz.'],correct:2,why:'Das Signal wiederholt sich 1 / 0,008 s = 125-mal pro Sekunde. Die Messung erfasst 1 / 0,001 s = 1000 Werte pro Sekunde.'},
    {title:'Nur die Bitzahl wird erhöht; Uref und Abtastrate bleiben gleich. Dann …',answers:['werden die Spannungsintervalle schmaler.','liegen die Messzeitpunkte dichter.','wird die Signalfrequenz größer.'],correct:0,why:'Mehr Bits liefern mehr Codes und schmalere Spannungsintervalle. Signal und Abtastzeitpunkte bleiben gleich.'},
    {title:'Nur das Abtastintervall wird halbiert. Dann …',answers:['halbiert sich die Schrittweite ΔU.','verdoppelt sich die Abtastfrequenz.','halbiert sich die Frequenz des Eingangssignals.'],correct:1,why:'fₐ = 1 / Tₐ: Das halbe Intervall bedeutet die doppelte Zahl von Erfassungen pro Sekunde.'}
  ];
  function resetQuiz(){
    $('quiz').innerHTML=questions.map((q,i)=>`<fieldset class="quiz-item"><legend>${i+1}. ${q.title}</legend>${q.answers.map((a,j)=>`<label><input type="radio" name="quiz-${i}" value="${j}">${a}</label>`).join('')}<p id="feedback-${i}" class="feedback" hidden></p></fieldset>`).join('');
    $('quiz-score').textContent='Noch keine Antworten geprüft.';
  }
  $('quiz-check').addEventListener('click',()=>{
    let correct=0,answered=0;
    questions.forEach((q,i)=>{
      const chosen=document.querySelector(`input[name="quiz-${i}"]:checked`),f=$('feedback-'+i);
      f.hidden=false;if(!chosen){f.className='feedback';f.textContent='Bitte wählen Sie zunächst eine Antwort.';return;}
      answered++;const ok=Number(chosen.value)===q.correct;if(ok)correct++;
      f.className='feedback '+(ok?'correct':'incorrect');f.textContent=(ok?'Richtig. ':'Noch nicht richtig. ')+q.why;
    });
    $('quiz-score').textContent=`${correct} von ${questions.length} richtig. ${questions.length-answered} noch unbeantwortet.`;
  });
  $('quiz').addEventListener('change',e=>{if(e.target.name){const i=Number(e.target.name.split('-')[1]);$('feedback-'+i).hidden=true;$('quiz-score').textContent='Antwort geändert. Bitte erneut prüfen.';}});
  $('quiz-reset').addEventListener('click',resetQuiz);
  function selectPanel(id){
    if(!['quant','resolution','sampling','check'].includes(id))id='quant';
    stop();document.querySelectorAll('.panel').forEach(p=>p.hidden=p.id!==id);
    document.querySelectorAll('[data-panel]').forEach(b=>{const selected=b.dataset.panel===id;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
  }
  document.querySelectorAll('[data-panel]').forEach(b=>b.addEventListener('click',()=>{selectPanel(b.dataset.panel);history.replaceState(null,'','#'+b.dataset.panel);}));
  window.addEventListener('hashchange',()=>selectPanel(location.hash.slice(1)));
  renderQ();renderR();renderS();resetQuiz();selectPanel(location.hash.slice(1));
})();
