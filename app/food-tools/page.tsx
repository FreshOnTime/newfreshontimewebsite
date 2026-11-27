import {EditorialHeader} from '@/components/discovery/Editorial';
import FoodCalculators from '@/components/discovery/FoodCalculators';
import {pageMetadata} from '@/lib/seo';
export const metadata=pageMetadata({title:'Food tools',path:'/food-tools',description:'Compare food unit prices and estimate the cost of a meal.'});
export default function Page(){return <div className="fp26-shell pb-12"><EditorialHeader eyebrow="The FreshPick toolkit" title="Choose with confidence." description="Two practical tools to help you understand dining budgets and the value of food products."/><FoodCalculators/></div>}
