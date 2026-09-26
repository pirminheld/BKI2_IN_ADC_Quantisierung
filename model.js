(function (root) {
  'use strict';
  function adc(voltage, bits, reference) {
    if (!Number.isInteger(bits) || bits < 1 || bits > 16 || !Number.isFinite(reference) || reference <= 0) throw new RangeError('Ungültige ADC-Einstellung');
    if (!Number.isFinite(voltage) || voltage < 0 || voltage > reference) throw new RangeError('Spannung außerhalb des Eingangsbereichs');
    const levels = 2 ** bits, step = reference / levels;
    // Snap only floating-point roundoff at a mathematical boundary.
    const ratio = voltage / step;
    const boundary = Math.round(ratio);
    const normalized = Math.abs(ratio - boundary) <= 8 * Number.EPSILON * Math.max(1, Math.abs(ratio)) ? boundary : ratio;
    const code = Math.min(levels - 1, Math.floor(normalized));
    return {voltage, bits, reference, levels, step, code, max:levels-1, binary:code.toString(2).padStart(bits,'0'), lower:code*step, upper:(code+1)*step};
  }
  function signal(tMs, periodMs) { return 2 + Math.sin(2 * Math.PI * tMs / periodMs); }
  function sampling(periodMs, intervalMs, durationMs=8) {
    if (![periodMs,intervalMs,durationMs].every(Number.isFinite) || periodMs <= 0 || intervalMs <= 0 || durationMs <= 0 || durationMs / intervalMs > 10000) throw new RangeError('Ungültige Zeitwerte');
    return {periodMs, intervalMs, durationMs, frequency:1000/periodMs, sampleFrequency:1000/intervalMs, intervalsPerPeriod:periodMs/intervalMs,
      points:Array.from({length:Math.floor(durationMs/intervalMs+1e-10)+1},(_,i)=>({t:i*intervalMs,u:signal(i*intervalMs,periodMs)}))};
  }
  const api = {adc,signal,sampling};
  if(typeof module !== 'undefined' && module.exports) module.exports=api;
  else root.ADCModel=Object.freeze(api);
})(typeof window !== 'undefined' ? window : this);
