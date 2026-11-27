import {DepartmentMenu} from '@/components/discovery/DepartmentMenu';
import {EditorialHeader} from '@/components/discovery/Editorial';
import {pageMetadata} from '@/lib/seo';
export const metadata=pageMetadata({path:'/explore',title:'Explore the world of food in Sri Lanka',description:'Discover restaurants, cafés, bakeries, caterers, fresh produce, local food brands, makers and gifts in Sri Lanka.'});
export default function Explore(){return <div className="fp26-shell"><EditorialHeader eyebrow="Discover Sri Lanka" title="A world of food to explore." description="Choose a department, find businesses and offerings, and learn more about the people behind the food."/><DepartmentMenu title="Find your next favourite"/></div>}
