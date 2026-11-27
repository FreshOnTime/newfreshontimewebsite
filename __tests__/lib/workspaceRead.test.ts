import {readWorkspace} from '@/lib/api/workspace-read';
import {authenticatedApiFetch} from '@/lib/api/authenticated-fetch';
jest.mock('@/lib/api/authenticated-fetch',()=>({authenticatedApiFetch:jest.fn()}));
const fetchMock=authenticatedApiFetch as jest.Mock;
beforeEach(()=>jest.resetAllMocks());
it('returns successful JSON without caching private workspace data',async()=>{fetchMock.mockResolvedValue({ok:true,json:async()=>({ok:true})});await expect(readWorkspace('/api/example')).resolves.toEqual({ok:true});expect(fetchMock).toHaveBeenCalledWith('/api/example',expect.objectContaining({cache:'no-store',signal:expect.any(AbortSignal)}));});
it('stops a stalled read and offers retry instead of indefinite loading',async()=>{fetchMock.mockImplementation(()=>new Promise(()=>{}));await expect(readWorkspace('/api/example',undefined,5)).rejects.toThrow('taking longer');expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);});
it('cancels when the caller leaves the workspace',async()=>{const controller=new AbortController();fetchMock.mockImplementation(()=>new Promise(()=>{}));const p=readWorkspace('/api/example',controller.signal);controller.abort();await expect(p).rejects.toMatchObject({name:'AbortError'});});
it('never retries a forbidden read as a mutation',async()=>{fetchMock.mockResolvedValue({ok:false,status:403});await expect(readWorkspace('/api/example')).rejects.toThrow('do not have access');expect(fetchMock).toHaveBeenCalledTimes(1);});
