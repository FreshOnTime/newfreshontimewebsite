import {matchGuides} from '@/lib/guideSearch';
import {matchDishes} from '@/lib/foodAtlas';
const guides=[{title:'Hoppers vs string hoppers',summary:'Rice noodles with curry',category:'Comparison',location:'',aliases:['breakfast']},{title:'Sri Lankan breakfast ideas',summary:'Try egg hoppers or coconut roti',category:'Meal ideas',location:'',aliases:['morning meals']}];
it('does not surface unrelated guides for an impossible search',()=>{expect(matchGuides(guides,'visual-no-match-000')).toEqual([]);expect(matchGuides(guides,'nonexistent breakfast xyz')).toEqual([]);});
it('matches meaningful terms and dish aliases',()=>{expect(matchGuides(guides,'What are hoppers?')).toHaveLength(2);expect(matchGuides(guides,'rice noodles')).toHaveLength(1);expect(matchDishes('කොත්තු').map(d=>d.slug)).toEqual(['kottu']);});
