import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { ArrowLeft, Shield } from 'lucide-react';

export default function Privacy() {
  const sections = [
    {
      title: '1. Information We Collect',
      content: `We collect information you provide directly, including:
• Account information (name, email, phone number)
• Profile information (photo, bio)
• Booking details and preferences
• Communications with hosts and support
• Payment information (processed securely by our payment providers)

We also automatically collect:
• Device and browser information
• IP address and location data
• Usage patterns and preferences`,
    },
    {
      title: '2. How We Use Your Information',
      content: `Your information helps us:
• Facilitate bookings between Guests and Hosts
• Process payments and prevent fraud
• Provide customer support
• Send booking confirmations and updates
• Improve our services and user experience
• Comply with legal obligations`,
    },
    {
      title: '3. Information Sharing',
      content: `We share your information with:
• Hosts (when you make a booking)
• Guests (if you're a Host, for bookings)
• Payment processors for transactions
• Service providers who assist our operations
• Law enforcement when required by law

We never sell your personal information to third parties.`,
    },
    {
      title: '4. Data Security',
      content: `We implement appropriate security measures including:
• Encryption of sensitive data in transit and at rest
• Secure authentication systems
• Regular security audits
• Access controls for our team members

While we strive to protect your data, no system is completely secure. Please use strong passwords and protect your account credentials.`,
    },
    {
      title: '5. Your Rights',
      content: `You have the right to:
• Access your personal information
• Correct inaccurate data
• Delete your account and data
• Export your data
• Opt out of marketing communications
• Withdraw consent where applicable

To exercise these rights, contact us at privacy@agribnv.com.`,
    },
    {
      title: '6. Cookies and Tracking',
      content: `We use cookies and similar technologies to:
• Keep you signed in
• Remember your preferences
• Analyze usage patterns
• Improve our services

You can manage cookie preferences in your browser settings.`,
    },
    {
      title: '7. Data Retention',
      content: `We retain your information:
• While your account is active
• As needed to provide services
• As required by legal obligations
• For legitimate business purposes (e.g., dispute resolution)

After account deletion, some data may be retained in anonymized form for analytics.`,
    },
    {
      title: '8. Children\'s Privacy',
      content: `Agribnv is not intended for users under 18 years of age. We do not knowingly collect information from children. If you believe a child has provided us with personal information, please contact us.`,
    },
    {
      title: '9. International Data Transfers',
      content: `Your data may be processed in countries outside the Philippines. We ensure appropriate safeguards are in place for international transfers in compliance with applicable data protection laws.`,
    },
    {
      title: '10. Changes to This Policy',
      content: `We may update this Privacy Policy periodically. We will notify you of significant changes via email or through the Platform. Your continued use after changes indicates acceptance.`,
    },
    {
      title: '11. Contact Us',
      content: `For privacy-related questions or concerns:
• Email: privacy@agribnv.com
• Address: Guimaras, Philippines

Data Protection Officer: privacy@agribnv.com`,
    },
  ];

  return (
    <Layout showMobileNav={false}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm px-4 py-4 border-b border-border/30">
        <div className="flex items-center gap-4 max-w-2xl mx-auto">
          <Link to="/profile">
            <motion.button whileTap={{ scale: 0.9 }} className="p-2 -ml-2">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </motion.button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Privacy Policy</h1>
        </div>
      </div>

      <div className="container py-8 max-w-2xl mx-auto px-4">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 rounded-2xl p-5 mb-6 flex gap-4 items-start"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground mb-1">Your Privacy Matters</h2>
            <p className="text-sm text-muted-foreground">
              We're committed to protecting your personal information and being transparent about how we use it.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <p className="text-sm text-muted-foreground">
            Last updated: January 2024
          </p>
        </motion.div>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.04 }}
              className="bg-card rounded-xl p-5 shadow-soft"
            >
              <h2 className="font-semibold text-foreground mb-3">{section.title}</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          <p>© 2024 Agribnv. All rights reserved.</p>
        </motion.div>
      </div>
    </Layout>
  );
}
