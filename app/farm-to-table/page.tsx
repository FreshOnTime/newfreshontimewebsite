import { permanentRedirect } from 'next/navigation';

// Preserve bookmarked producer URLs after consolidating both business journeys.
export default function FarmToTablePage() {
  permanentRedirect('/b2b#supplier-partnerships');
}
