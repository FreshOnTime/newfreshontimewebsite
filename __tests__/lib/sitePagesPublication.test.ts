import prisma from '@/lib/prisma';
import {getPageConfig} from '@/lib/sitePages';
import {pageDefaults} from '@/lib/sitePageConfig';
jest.mock('@/lib/prisma',()=>({__esModule:true,default:{sitePageContent:{findFirst:jest.fn()}}}));
it('reads only live settings for explicitly published page rows',async()=>{const find=prisma.sitePageContent.findFirst as jest.Mock;find.mockResolvedValueOnce(null);expect(await getPageConfig('home')).toEqual(pageDefaults.home);expect(find).toHaveBeenCalledWith({where:{key:'home',publishedAt:{not:null}},select:{live:true,publishedAt:true}});find.mockResolvedValueOnce({live:{...pageDefaults.home,title:'Published title'},draft:{...pageDefaults.home,title:'Private title'},publishedAt:new Date()});expect((await getPageConfig('home')).title).toBe('Published title');});
