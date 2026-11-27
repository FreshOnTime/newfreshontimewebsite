import prisma from '@/lib/prisma';
import {listProspects,publicLink,searchText,pageNumber,publicProspectWhere,publicProspectSelect} from '@/lib/discovery';
jest.mock('@/lib/prisma',()=>({__esModule:true,default:{discoveryProspect:{findMany:jest.fn()}}}));
beforeEach(()=>jest.clearAllMocks());
it('always restricts directory queries to explicitly reviewed and cleared profiles',async()=>{
 (prisma.discoveryProspect.findMany as jest.Mock).mockResolvedValue([]);
 for(const mode of ['all','makers','dining','products','gifting'] as const){
   await listProspects(mode,'coffee','Colombo',2);
   expect(prisma.discoveryProspect.findMany).toHaveBeenLastCalledWith(expect.objectContaining({where:expect.objectContaining({AND:expect.arrayContaining([publicProspectWhere])}),select:publicProspectSelect,skip:24,take:25}));
 }
 expect(publicProspectSelect).not.toHaveProperty('reviewNotes');
 expect(publicProspectSelect).not.toHaveProperty('sourceUrl');
});
it('only creates actual HTTPS links and checks social host boundaries',()=>{
 expect(publicLink('https://www.instagram.com/example/','instagram.com')).toBe('https://www.instagram.com/example/');
 expect(publicLink('example','instagram.com')).toBeNull();
 expect(publicLink('javascript:alert(1)')).toBeNull();
 expect(publicLink('https://instagram.com.evil.example/','instagram.com')).toBeNull();
 expect(publicLink('https://user:pass@instagram.com/','instagram.com')).toBeNull();
});
it('bounds filter input and rejects invalid page values',()=>{
 expect(searchText(['x'])).toBe('');
 expect(searchText('a'.repeat(150))).toHaveLength(100);
 expect(pageNumber('-1')).toBe(1);
 expect(pageNumber('0')).toBe(1);
 expect(pageNumber('2')).toBe(2);
});

it('keeps reviewed imported businesses searchable under the same type filters',async()=>{
 (prisma.discoveryProspect.findMany as jest.Mock).mockResolvedValue([]);
 await listProspects('dining','','',1,{type:'cafe'});
 expect(prisma.discoveryProspect.findMany).toHaveBeenCalledWith(expect.objectContaining({where:expect.objectContaining({AND:expect.arrayContaining([publicProspectWhere,{category:{in:['Café','Café / mobile coffee']}}])})}));
});

it('excludes dining categories from the independent food brand directory',async()=>{(prisma.discoveryProspect.findMany as jest.Mock).mockResolvedValue([]);await listProspects('makers','','',1);expect(prisma.discoveryProspect.findMany).toHaveBeenCalledWith(expect.objectContaining({where:expect.objectContaining({AND:expect.arrayContaining([{category:{notIn:expect.arrayContaining(['Restaurant','Café','Bakery','Home bakery','Home catering','Home kitchen'])}}])})}));});