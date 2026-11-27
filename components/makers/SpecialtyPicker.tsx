'use client';
import { useState } from 'react';
import { businessSpecialties, specialtyLabels, type BusinessSpecialty } from '@/lib/businessSpecialties';
export default function SpecialtyPicker({initial=[],value,onChange}:{initial?:readonly string[];value?:BusinessSpecialty[];onChange?:(value:BusinessSpecialty[])=>void}){
  const [local,setLocal]=useState<BusinessSpecialty[]>(()=>businessSpecialties.filter(s=>initial.includes(s)).slice(0,8));
  const selected=value??local;
  function toggle(s:BusinessSpecialty,checked:boolean){
    const next=checked?[...selected,s]:selected.filter(v=>v!==s);
    if(next.length>8)return;
    if(onChange)onChange(next);else setLocal(next);
  }
  return <fieldset className="grid gap-3 rounded-lg border border-border p-3 sm:p-4">
    <legend className="px-1 text-sm font-semibold">Business specialities (optional)</legend>
    <p className="text-sm leading-5 text-muted-foreground">Choose up to 8 that describe what customers can find from your business. You can update these in Business Studio.</p>
    <div className="grid gap-2 sm:grid-cols-2">{businessSpecialties.map(s=><label key={s} className="flex min-h-11 items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"><input type="checkbox" name="businessSpecialties" value={s} checked={selected.includes(s)} disabled={!selected.includes(s)&&selected.length>=8} onChange={e=>toggle(s,e.target.checked)}/><span>{specialtyLabels[s]}</span></label>)}</div>
    <p className="text-xs text-muted-foreground" aria-live="polite">{selected.length} of 8 selected</p>
  </fieldset>;
}
