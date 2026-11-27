import {EditorialHeader} from '@/components/discovery/Editorial';
import FoodCalculators from '@/components/discovery/FoodCalculators';
import {pageMetadata} from '@/lib/seo';
export const metadata=pageMetadata({title:'Food tools',path:'/food-tools',description:'Compare food unit prices and estimate the cost of a meal.'});
export default function Page(){return <div className="fp26-shell pb-12"><EditorialHeader eyebrow="The FreshPick toolkit" title="Food tools." description="Estimate your total dining bill or compare the cost of products by weight. No account required."/><FoodCalculators/></div>}
