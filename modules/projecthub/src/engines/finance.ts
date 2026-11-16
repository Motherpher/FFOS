export type Money={currency:string;minorUnits:bigint};
export type FinanceRow={kind:"BUDGET"|"ACTUAL"|"FORECAST"|"FUNDING_SECURED"|"FUNDING_APPLIED"|"FUNDING_ALLOCATED";amount:Money};

function assertCurrency(rows:FinanceRow[]){
  const currencies=[...new Set(rows.map(x=>x.amount.currency))];
  if(currencies.length>1)throw new Error("MULTI_CURRENCY_REQUIRES_EXPLICIT_CONVERSION");
  return currencies[0]??null;
}
const sum=(rows:FinanceRow[],kind:FinanceRow["kind"])=>
  rows.filter(x=>x.kind===kind).reduce((a,x)=>a+x.amount.minorUnits,0n);

export function evaluateFinance(rows:FinanceRow[]){
  const currency=assertCurrency(rows);
  if(!currency)return {status:"UNKNOWN",currency:null,planned:null,actual:null,forecast:null,fundingSecured:null,fundingApplied:null,fundingAllocated:null,fundingGap:null,variance:null,signals:[]};
  const planned=sum(rows,"BUDGET"),actual=sum(rows,"ACTUAL"),forecast=sum(rows,"FORECAST");
  const fundingSecured=sum(rows,"FUNDING_SECURED"),fundingApplied=sum(rows,"FUNDING_APPLIED"),fundingAllocated=sum(rows,"FUNDING_ALLOCATED");
  const gap=planned-fundingSecured;const variance=forecast-planned;const signals:any[]=[];
  if(gap>0n)signals.push({code:"FUNDING_GAP",minorUnits:gap.toString(),currency});
  if(variance>0n)signals.push({code:"FORECAST_OVER_PLAN",minorUnits:variance.toString(),currency});
  return {status:signals.length?"ATTENTION":"OK",currency,planned,actual,forecast,fundingSecured,fundingApplied,fundingAllocated,fundingGap:gap,variance,signals};
}
