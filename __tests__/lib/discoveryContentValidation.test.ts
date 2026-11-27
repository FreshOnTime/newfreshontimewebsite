import {contentInput} from '@/lib/discoveryContentValidation';
const draft={kind:'event',slug:'test-event',title:'Test event',category:'Workshop',summary:'Test summary',body:'Test body',aliases:[],variations:[],relatedDishes:[],searchTerm:'',sourceUrl:'',sourceName:'',location:'',startsAt:null,endsAt:null,published:false,confirmed:false};
it('allows private drafts and requires verified source and time range for publication',()=>{
 expect(contentInput.safeParse(draft).success).toBe(true);
 expect(contentInput.safeParse({...draft,published:true}).success).toBe(false);
 const published={...draft,published:true,confirmed:true,sourceUrl:'https://example.org/events/test',sourceName:'Organizer',location:'Test location',startsAt:'2027-01-01T10:00:00+05:30',endsAt:'2027-01-01T12:00:00+05:30'};
 expect(contentInput.safeParse(published).success).toBe(true);
 expect(contentInput.safeParse({...published,endsAt:published.startsAt}).success).toBe(false);
 expect(contentInput.safeParse({...published,sourceUrl:'javascript:alert(1)'}).success).toBe(false);
 expect(contentInput.safeParse({...published,slug:'../test'}).success).toBe(false);
 expect(contentInput.safeParse({...published,kind:'tradition'}).success).toBe(false);
 expect(contentInput.safeParse({...published,confirmed:false}).success).toBe(false);
});
