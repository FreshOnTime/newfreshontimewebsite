import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const serviceWorker = fs.readFileSync(path.join(process.cwd(), 'public/sw.js'), 'utf8');

function harness() {
  const listeners: Record<string, (event: any) => void> = {};
  const stale = { body: 'old unpublished headline' };
  const offline = { body: 'offline fallback' };
  const fresh = { body: 'new published headline' };
  const fetchNetwork = jest.fn().mockResolvedValue(fresh);
  const caches = {
    match: jest.fn().mockImplementation(async (request: unknown) => request === '/offline' ? offline : stale),
    open: jest.fn(),
    keys: jest.fn().mockResolvedValue(['freshpick-static-v4','freshpick-dynamic-v5','freshpick-static-v5','other-app']),
    delete: jest.fn().mockResolvedValue(true),
  };
  vm.runInNewContext(serviceWorker, {
    URL, Response: {error: () => ({body:'network error'})}, fetch: fetchNetwork, caches,
    self: {location:{origin:'https://freshpick.lk'},addEventListener:(name:string,handler:(event:any)=>void)=>{listeners[name]=handler},clients:{claim:jest.fn()},skipWaiting:jest.fn()},
  });
  function request(url:string, mode='navigate', rsc=false) {
    let response:Promise<unknown>|undefined;
    const req={url:'https://freshpick.lk'+url,method:'GET',mode,headers:{get:(name:string)=>name==='RSC'&&rsc?'1':null}};
    listeners.fetch({request:req,respondWith:(p:Promise<unknown>)=>{response=p}});
    return {response,req};
  }
  return {listeners,fetchNetwork,caches,fresh,offline,request};
}

it('does not cache retired storefront routes', () => {
  expect(serviceWorker).not.toContain('"/meal-kits"');
  expect(serviceWorker).not.toContain('"/farm-to-table"');
});

it('fetches current CMS pages even when a stale document exists in Cache Storage', async () => {
  const h=harness();
  for(const url of ['/','/discover?q=coffee','/experiences/events/a','/live','/admin/site-pages']){
    const {req,response}=h.request(url);
    expect(await response).toBe(h.fresh);
    expect(h.fetchNetwork).toHaveBeenLastCalledWith(req,{cache:'no-store'});
  }
  expect(h.caches.match).not.toHaveBeenCalled();
  expect(h.caches.open).not.toHaveBeenCalled();
});

it('never reads or stores RSC payloads, including private routes and query-marker requests', async () => {
  const h=harness();
  for(const [url,rsc] of [['/',true],['/admin/site-pages',true],['/discover?_rsc=abc',false]] as const){
    const {req,response}=h.request(url,'cors',rsc);
    expect(await response).toBe(h.fresh);
    expect(h.fetchNetwork).toHaveBeenLastCalledWith(req,{cache:'no-store'});
  }
  expect(h.caches.match).not.toHaveBeenCalled();
  expect(h.caches.open).not.toHaveBeenCalled();
});

it('uses only the dedicated offline page when a document request fails',async()=>{
  const h=harness();h.fetchNetwork.mockRejectedValueOnce(new Error('offline'));
  expect(await h.request('/').response).toBe(h.offline);
  expect(h.caches.match).toHaveBeenCalledWith('/offline');
  expect(h.caches.match).toHaveBeenCalledTimes(1);
});

it('removes retired FreshPick cache generations without touching other applications',async()=>{
  const h=harness();let completion:Promise<unknown>|undefined;
  h.listeners.activate({waitUntil:(p:Promise<unknown>)=>{completion=p}});
  await completion;
  expect(h.caches.delete.mock.calls).toEqual([['freshpick-static-v4'],['freshpick-dynamic-v5']]);
});

it('does not intercept APIs or cache arbitrary mutable content assets',()=>{
  const h=harness();
  expect(h.request('/api/live','cors').response).toBeUndefined();
  expect(h.request('/uploads/photo.jpg','cors').response).toBeUndefined();
  expect(h.caches.open).not.toHaveBeenCalled();
});
