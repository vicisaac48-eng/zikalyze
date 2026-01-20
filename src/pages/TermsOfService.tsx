import { Link } from "react-router-dom";
import { ArrowLeft, FileText, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const TermsOfService = () => {
  const lastUpdated = "January 20, 2025";

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
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">1. Agreement to Terms</h2>
            <p className="text-muted-foreground mt-4">
              Welcome to Zikalyze. These Terms of Service ("Terms") govern your access to and use of our AI-powered 
              cryptocurrency analysis platform, including any content, functionality, and services offered through 
              our website and applications (collectively, the "Service").
            </p>
            <p className="text-muted-foreground">
              By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these 
              Terms, you must not access or use the Service.
            </p>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">2. Eligibility</h2>
            <p className="text-muted-foreground mt-4">
              You must be at least 18 years old to use the Service. By using the Service, you represent and warrant that:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-1">
              <li>You are at least 18 years of age</li>
              <li>You have the legal capacity to enter into these Terms</li>
              <li>You are not prohibited from using the Service under applicable laws</li>
              <li>Your use of the Service does not violate any applicable law or regulation</li>
            </ul>
          </section>

          {/* Account */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">3. Account Registration</h2>
            <p className="text-muted-foreground mt-4">
              To access certain features of the Service, you must create an account. When creating an account, you agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-1">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized access to your account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              We reserve the right to suspend or terminate your account if any information provided is inaccurate, 
              false, or in violation of these Terms.
            </p>
          </section>

          {/* Service Description */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">4. Service Description</h2>
            <p className="text-muted-foreground mt-4">
              Zikalyze provides AI-powered cryptocurrency market analysis, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-1">
              <li>Real-time price tracking and market data visualization</li>
              <li>AI-generated market analysis and predictions</li>
              <li>Technical indicators and chart analysis</li>
              <li>Price alerts and notifications</li>
              <li>Portfolio tracking features</li>
              <li>Smart Money Concepts and ICT analysis</li>
            </ul>
          </section>

          {/* Important Disclaimer */}
          <section className="bg-destructive/10 border border-destructive/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">5. Important Disclaimer - Not Financial Advice</h2>
            <div className="mt-4 space-y-3">
              <p className="text-foreground font-medium">
                THE SERVICE IS FOR INFORMATIONAL AND EDUCATIONAL PURPOSES ONLY.
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Nothing contained in the Service constitutes:</strong>
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Financial, investment, trading, or legal advice</li>
                <li>A recommendation to buy, sell, or hold any cryptocurrency</li>
                <li>A solicitation or offer to buy or sell securities</li>
                <li>A guarantee of future performance or results</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                Cryptocurrency investments are highly volatile and risky. You may lose some or all of your investment. 
                Always conduct your own research and consult with a qualified financial advisor before making any 
                investment decisions. Past performance is not indicative of future results.
              </p>
              <p className="text-muted-foreground">
                AI-generated predictions and analysis are based on historical data and algorithms and should not be 
                relied upon as the sole basis for investment decisions.
              </p>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">6. Acceptable Use</h2>
            <p className="text-muted-foreground mt-4">You agree not to:</p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-1">
              <li>Use the Service for any unlawful purpose or in violation of any laws</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated scripts, bots, or scrapers to access the Service</li>
              <li>Transmit viruses, malware, or other harmful code</li>
              <li>Impersonate any person or entity</li>
              <li>Use the Service to manipulate or deceive other users</li>
              <li>Resell, redistribute, or commercially exploit the Service without permission</li>
              <li>Reverse engineer or attempt to extract source code from the Service</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">7. Intellectual Property</h2>
            <p className="text-muted-foreground mt-4">
              The Service and its original content, features, and functionality are owned by Zikalyze and are protected 
              by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="text-muted-foreground mt-3">
              You are granted a limited, non-exclusive, non-transferable license to access and use the Service for 
              personal, non-commercial purposes, subject to these Terms.
            </p>
          </section>

          {/* Third-Party Data */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">8. Third-Party Data and Services</h2>
            <p className="text-muted-foreground mt-4">
              The Service may display data from third-party sources, including cryptocurrency exchanges, market data 
              providers, and on-chain analytics platforms. We do not guarantee the accuracy, completeness, or timeliness 
              of third-party data.
            </p>
            <p className="text-muted-foreground mt-3">
              We are not responsible for any third-party websites, services, or content linked to or from the Service.
            </p>
          </section>

          {/* Privacy */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">9. Privacy</h2>
            <p className="text-muted-foreground mt-4">
              Your use of the Service is also governed by our{" "}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, which describes how 
              we collect, use, and protect your personal information. By using the Service, you consent to the 
              collection and use of information as described in our Privacy Policy.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">10. Limitation of Liability</h2>
            <p className="text-muted-foreground mt-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-2">
              <li>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED
              </li>
              <li>
                WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE
              </li>
              <li>
                WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES
              </li>
              <li>
                WE SHALL NOT BE LIABLE FOR ANY LOSS OF PROFITS, DATA, OR OTHER INTANGIBLE LOSSES
              </li>
              <li>
                WE SHALL NOT BE LIABLE FOR ANY TRADING LOSSES OR INVESTMENT DECISIONS MADE BASED ON THE SERVICE
              </li>
              <li>
                OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE PAST 12 MONTHS, IF ANY
              </li>
            </ul>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">11. Indemnification</h2>
            <p className="text-muted-foreground mt-4">
              You agree to defend, indemnify, and hold harmless Zikalyze, its affiliates, and their respective officers, 
              directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including 
              legal fees) arising out of or related to your use of the Service or violation of these Terms.
            </p>
          </section>

          {/* Modifications */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">12. Modifications to Service and Terms</h2>
            <p className="text-muted-foreground mt-4">
              We reserve the right to modify, suspend, or discontinue the Service at any time without notice. We also 
              reserve the right to modify these Terms at any time. Material changes will be communicated via email or 
              through the Service. Your continued use of the Service after changes constitutes acceptance of the 
              modified Terms.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">13. Termination</h2>
            <p className="text-muted-foreground mt-4">
              We may terminate or suspend your account and access to the Service immediately, without prior notice, for 
              any reason, including breach of these Terms. Upon termination, your right to use the Service will 
              immediately cease.
            </p>
            <p className="text-muted-foreground mt-3">
              You may terminate your account at any time through the Settings page. Upon termination, your data will 
              be handled in accordance with our Privacy Policy.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">14. Governing Law and Dispute Resolution</h2>
            <p className="text-muted-foreground mt-4">
              These Terms shall be governed by and construed in accordance with applicable laws, without regard to 
              conflict of law principles. Any disputes arising from these Terms or the Service shall be resolved 
              through binding arbitration, except where prohibited by law.
            </p>
            <p className="text-muted-foreground mt-3">
              For users in the European Union, nothing in these Terms affects your statutory rights under applicable 
              consumer protection laws.
            </p>
          </section>

          {/* Severability */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">15. Severability</h2>
            <p className="text-muted-foreground mt-4">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited 
              or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force 
              and effect.
            </p>
          </section>

          {/* Entire Agreement */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">16. Entire Agreement</h2>
            <p className="text-muted-foreground mt-4">
              These Terms, together with the Privacy Policy, constitute the entire agreement between you and Zikalyze 
              regarding the Service and supersede all prior agreements and understandings.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">17. Contact Us</h2>
            <p className="text-muted-foreground mt-4">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="mt-3 p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-foreground font-medium">Zikalyze Legal</p>
              <p className="text-muted-foreground">Email: <span className="text-primary">legal@zikalyze.com</span></p>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
          <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <span>•</span>
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;
