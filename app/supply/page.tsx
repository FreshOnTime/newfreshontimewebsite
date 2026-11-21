import { permanentRedirect } from 'next/navigation';

// Retired public weekly-offer page; keep old links working.
export default function SupplyPage() {
  permanentRedirect('/b2b#business-enquiry');
}
