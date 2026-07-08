import json, datetime, re
rows=json.load(open('tasks.json'))
ANALYSIS=datetime.date(2026,7,8)

def parse(dt):
    if not dt: return None
    return datetime.datetime.strptime(dt[:10],'%Y-%m-%d').date()
def fmt(d): return d.strftime('%d.%m.%y') if d else '—'
def days(durstr):
    if not durstr: return 0
    m=re.match(r'([\d.]+)',durstr); return int(float(m.group(1))) if m else 0

def contour_stage(i):
    if i==1: return ('Общий','Контрольные точки')
    if 3<=i<=21: return ('КОЭ','Подготовка LLM-моделей и ЦСР ФИАС')
    if 23<=i<=47: return ('КОЭ','Установка и МПИД на КОЭ')
    if 49<=i<=72: return ('КПЭ','Подготовительные работы КПЭ')
    if 74<=i<=88: return ('КПЭ','Установка и МПИД на КПЭ')
    return (None,None)

def responsible(res):
    if not res: return 'Не назначен'
    first=res.split(',')[0].strip()
    if first.startswith('ГНИВЦ'): return 'ГНИВЦ'
    for o in ('ФКУ','УИБ','УИТ'):
        if first.startswith(o): return o
    return first

def status(pct, s, f):
    pct=float(pct or 0)
    if pct>=100: return 'Завершено'
    if f and f<ANALYSIS: return 'Просрочка'
    if f and ANALYSIS<=f<=ANALYSIS+datetime.timedelta(days=7): return 'Риск'
    if (s and f and s<=ANALYSIS<=f) or pct>0: return 'В работе'
    if s and s>ANALYSIS: return 'План'
    return 'План'

skip={0,2,22,48,73}
out=[]
from collections import Counter
sc=Counter()
for r in rows:
    i=r['id']
    if i in skip: continue
    c,st=contour_stage(i)
    if c is None: continue
    s=parse(r['start']); f=parse(r['finish'])
    pct=int(float(r['pct'] or 0))
    stt=status(pct,s,f)
    sc[stt]+=1
    out.append(dict(contour=c,stage=st,name=r['name'],dur=days(r['dur']),
        start=fmt(s),finish=fmt(f),pred=r['pred'] or '—',members=r['res'] or '—',
        responsible=responsible(r['res']),status=stt,pct=pct,
        milestone=r['milestone']))
json.dump(out,open('data.json','w'),ensure_ascii=False)
print('rows',len(out))
print('status',dict(sc))
print('contours',Counter(o['contour'] for o in out))
print('responsible',Counter(o['responsible'] for o in out))
print('milestones',sum(1 for o in out if o['milestone']))
