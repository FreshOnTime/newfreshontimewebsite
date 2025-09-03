import BreadcrumbGenerator from "@/components/BreadcrumbGenerator";
import { PageContainer } from "@/components/templates/PageContainer";
import Markdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

const privacyPolicyContent = `
# Privacy Policy for Fresh Pick

*Last Updated: March 20, 2025*

## 1. Introduction
Fresh Pick is a grocery delivery service committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your information when you join our waitlist. We are currently in a pre-launch phase, and this policy applies to our "coming soon" page.

## 2. Information We Collect

### Personal Information:
When you join our waitlist, we collect:
- Email address (required)
- Full name (required)
- City (optional)
- Grocery delivery preferences (optional)

### Automatically Collected Information:
We may collect your IP address, browser type, and device information through Firebase for security and analytics purposes.

## 3. How We Use Your Information
- To notify you about our launch (email)
- To personalize communication (name)
- To plan delivery logistics (city)
- To understand user preferences (opinion)

## 4. How We Share Your Information
We use Firebase (Google) to store your data. Firebase may process your data on our behalf, subject to their privacy practices.

We do not share your data with others unless required by law.

## 5. How We Store and Secure Your Data
Your data is stored securely in Firebase Firestore, which uses encryption and access controls.

We retain your data until our launch or until you request deletion, whichever comes first.

## 6. Your Rights
You can access, update, or delete your data by emailing hello@freshpick.lk.

You can unsubscribe from emails at any time using the link in our emails.

## 7. Cookies and Tracking
We currently do not use cookies or third-party analytics tools on our "coming soon" page. If this changes, we will update this policy and seek your consent if required.

## 8. Children's Privacy
Our service is not intended for children under 13. We do not knowingly collect data from children.

## 9. Changes to This Policy
We may update this policy as our services expand, such as when we launch our full website and begin offering grocery delivery. We will notify you of changes via email or a notice on our website.

## 10. Contact Us
If you have questions, contact us at [hello@freshpick.lk](mailto:hello@freshpick.lk).
`;

export default function PrivacyPolicy() {
  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="mb-8">
          <BreadcrumbGenerator />
        </div>
        <Markdown
          rehypePlugins={[rehypeSanitize]}
          className="prose prose-green max-w-none prose-headings:text-gray-900 prose-p:text-gray-700"
        >
          {privacyPolicyContent}
        </Markdown>
      </div>
    </PageContainer>
  );
}
