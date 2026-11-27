'use client';
import {useState} from 'react';
const money=(n:number)=>'Rs. '+n.toLocaleString('en-LK',{maximumFractionDigits:2});
function num(v:string){const n=Number(v);return v.trim()!==''&&Number.isFinite(n)&&n>=0?n:null}
export default function FoodCalculators(){
 const [people,sp]=useState('2'),[meal,sm]=useState(''),[drinks,sd]=useState('0'),[fees,sf]=useState('0'),[tax,st]=useState('0'),[pa,sa]=useState(''),[qa,sqa]=useState(''),[pb,sb]=useState(''),[qb,sqb]=useState('');
 const p=num(people),m=num(meal),d=num(drinks),f=num(fees),t=num(tax);
 const bill=p!==null&&Number.isInteger(p)&&p>0&&p<=100&&m!==null&&d!==null&&f!==null&&f<=100&&t!==null&&t<=100?p*(m+d)*(1+f/100)*(1+t/100):null;
 const unit=(price:string,quantity:string)=>{const a=num(price),b=num(quantity);return a!==null&&b!==null&&b>0?a/b*100:null};
 const a=unit(pa,qa),b=unit(pb,qb);
 const field=(label:string,v:string,change:(v:string)=>void,step='0.01')=><label>{label}<input type="number" min="0" step={step} inputMode="decimal" className="fp26-input" value={v} onChange={e=>change(e.target.value)}/></label>;
 return <div className="fp26-tools"><section id="true-bill" className="fp26-panel"><p className="fp26-label">Dining calculator</p><h2>True Bill</h2>{field('Number of people',people,sp,'1')}{field('Food per person (Rs.)',meal,sm)}{field('Drinks per person (Rs.)',drinks,sd)}{field('Service charge (%)',fees,sf)}{field('Tax after service charge (%)',tax,st)}<div className="fp26-calculator-result" role="status">{bill===null?'Enter valid prices and charges.':'Estimated total: '+money(bill)}</div><p className="fp26-meta">Manual estimate only. Confirm the menu price, which charges apply and how the venue calculates them. Enter zero for charges already included.</p></section><section id="unit-price" className="fp26-panel"><p className="fp26-label">Product calculator</p><h2>Unit price comparison</h2>{field('Product A price (Rs.)',pa,sa)}{field('Product A weight (g)',qa,sqa)}{field('Product B price (Rs.)',pb,sb)}{field('Product B weight (g)',qb,sqb)}<div className="fp26-calculator-result" role="status"><p>A: {a===null?'—':money(a)+' / 100g'}</p><p>B: {b===null?'—':money(b)+' / 100g'}</p>{a!==null&&b!==null&&<p>{a===b?'Equal unit price.':(a<b?'Product A':'Product B')+' has the lower price per 100g.'}</p>}</div><p className="fp26-meta">Compare like-for-like products. Price alone does not measure quality.</p></section></div>
}
