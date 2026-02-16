import { Link } from "react-router-dom";
import { ArrowLeft, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
  const lastUpdated = "February 16, 2026";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Zikalyze</span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">1. Introduction</h2>
            <p className="text-muted-foreground mt-4">
              Welcome to Zikalyze ("we," "our," or "us"). We are committed to protecting your personal data and respecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered 
              cryptocurrency analysis platform (the "Service").
            </p>
            <p className="text-muted-foreground">
              This policy complies with the General Data Protection Regulation (GDPR) and other applicable data protection laws. 
              By using our Service, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          {/* Data Controller */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">2. Data Controller</h2>
            <p className="text-muted-foreground mt-4">
            Zikalyze is the data controller responsible for your personal data. For any questions about this Privacy Policy 
            or our data practices, please contact us at: <span className="text-primary">privacyzikalyze@gmail.com</span>
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">3. Information We Collect</h2>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-lg font-medium text-foreground">3.1 Information You Provide</h3>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>Account information (email address, password)</li>
                  <li>Profile information (display name, preferences)</li>
                  <li>Portfolio data (cryptocurrency holdings you choose to track)</li>
                  <li>Price alert configurations</li>
                  <li>Communication preferences</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground">3.2 Information Collected Automatically</h3>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>Device information (browser type, operating system)</li>
                  <li>Usage data (pages visited, features used, session duration)</li>
                  <li>IP address (anonymized for analytics)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground">3.3 Information from Third Parties</h3>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>Cryptocurrency market data from public APIs</li>
                  <li>On-chain analytics data (publicly available blockchain information)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Legal Basis */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">4. Legal Basis for Processing (GDPR)</h2>
            <div className="mt-4 space-y-3">
              <p className="text-muted-foreground">Under GDPR, we process your personal data based on the following legal grounds:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong className="text-foreground">Contract Performance:</strong> Processing necessary to provide our Service to you</li>
                <li><strong className="text-foreground">Legitimate Interests:</strong> Improving our Service, security, and fraud prevention</li>
                <li><strong className="text-foreground">Consent:</strong> Marketing communications and optional analytics (you may withdraw at any time)</li>
                <li><strong className="text-foreground">Legal Obligation:</strong> Compliance with applicable laws and regulations</li>
              </ul>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">5. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Provide, maintain, and improve our AI analysis services</li>
              <li>Send price alerts and notifications you've configured</li>
              <li>Personalize your experience and provide relevant insights</li>
              <li>Communicate with you about updates, security alerts, and support</li>
              <li>Analyze usage patterns to improve our algorithms and features</li>
              <li>Detect, prevent, and address technical issues and fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">6. Data Sharing and Disclosure</h2>
            <p className="text-muted-foreground mt-4">
              We do not sell your personal data. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-2">
              <li><strong className="text-foreground">Service Providers:</strong> Third-party vendors who assist in operating our Service (hosting, analytics)</li>
              <li><strong className="text-foreground">Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong className="text-foreground">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong className="text-foreground">With Your Consent:</strong> For any other purpose with your explicit consent</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">7. Your Rights (GDPR)</h2>
            <p className="text-muted-foreground mt-4">Under GDPR, you have the following rights:</p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-2">
              <li><strong className="text-foreground">Right of Access:</strong> Request a copy of your personal data</li>
              <li><strong className="text-foreground">Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong className="text-foreground">Right to Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
              <li><strong className="text-foreground">Right to Restrict Processing:</strong> Limit how we use your data</li>
              <li><strong className="text-foreground">Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
              <li><strong className="text-foreground">Right to Object:</strong> Object to processing based on legitimate interests</li>
              <li><strong className="text-foreground">Right to Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              To exercise these rights, please contact us at <span className="text-primary">privacyzikalyze@gmail.com</span> or use the 
              account deletion feature in Settings.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">8. Cookies and Tracking</h2>
            <p className="text-muted-foreground mt-4">
              We use cookies and similar technologies to enhance your experience. You can manage your cookie preferences 
              through our cookie consent banner or your browser settings.
            </p>
            <div className="mt-3 space-y-2">
              <p className="text-muted-foreground"><strong className="text-foreground">Essential Cookies:</strong> Required for the Service to function properly</p>
              <p className="text-muted-foreground"><strong className="text-foreground">Analytics Cookies:</strong> Help us understand how you use our Service</p>
              <p className="text-muted-foreground"><strong className="text-foreground">Preference Cookies:</strong> Remember your settings and preferences</p>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">9. Data Retention</h2>
            <p className="text-muted-foreground mt-4">
              We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy, 
              unless a longer retention period is required by law. When you delete your account, we will delete or anonymize 
              your personal data within 30 days, except where we are legally required to retain it.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">10. Data Security</h2>
            <p className="text-muted-foreground mt-4">
              We implement appropriate technical and organizational measures to protect your personal data, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-1">
              <li>Encryption of data in transit (TLS/SSL) and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication measures</li>
              <li>Two-factor authentication (2FA) option for your account</li>
            </ul>
          </section>

          {/* International Transfers */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">11. International Data Transfers</h2>
            <p className="text-muted-foreground mt-4">
              Your data may be transferred to and processed in countries outside the European Economic Area (EEA). 
              When we transfer data internationally, we ensure appropriate safeguards are in place, such as Standard 
              Contractual Clauses approved by the European Commission.
            </p>
          </section>

          {/* Children */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">12. Children's Privacy</h2>
            <p className="text-muted-foreground mt-4">
              Our Service is not intended for individuals under 18 years of age. We do not knowingly collect personal 
              data from children. If you believe a child has provided us with personal data, please contact us immediately.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">13. Changes to This Policy</h2>
            <p className="text-muted-foreground mt-4">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting 
              the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">14. Contact Us</h2>
            <p className="text-muted-foreground mt-4">
              If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
            </p>
            <div className="mt-3 p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-foreground font-medium">Zikalyze Data Protection</p>
              <p className="text-muted-foreground">Email: <span className="text-primary">privacyzikalyze@gmail.com</span></p>
              <p className="text-muted-foreground mt-2">
                You also have the right to lodge a complaint with your local data protection authority if you believe 
                your rights have been violated.
              </p>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
          <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          <span>•</span>
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
