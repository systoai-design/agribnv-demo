import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { ArrowLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Terms() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `By accessing and using Agribnv ("the Platform"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.`,
    },
    {
      title: '2. Description of Service',
      content: `Agribnv provides an online platform that connects travelers ("Guests") with farm property owners ("Hosts") offering accommodations and agricultural experiences in the Philippines. We facilitate bookings but are not a party to any rental agreement between Guests and Hosts.`,
    },
    {
      title: '3. User Accounts',
      content: `To access certain features of the Platform, you must register for an account. You agree to:
• Provide accurate, current, and complete information
• Maintain the security of your password
• Accept responsibility for all activities under your account
• Notify us immediately of any unauthorized use`,
    },
    {
      title: '4. Bookings and Payments',
      content: `When you book a property through Agribnv:
• You agree to pay all charges associated with your booking
• Prices are displayed in Philippine Pesos (₱)
• Service fees may apply to bookings
• Cancellation policies vary by property and are displayed before booking
• Refunds are processed according to the applicable cancellation policy`,
    },
    {
      title: '5. Host Responsibilities',
      content: `Hosts on Agribnv agree to:
• Provide accurate descriptions and photos of their properties
• Maintain safe and clean accommodations
• Honor confirmed bookings
• Comply with all applicable local laws and regulations
• Respond to Guest inquiries in a timely manner`,
    },
    {
      title: '6. Guest Responsibilities',
      content: `Guests on Agribnv agree to:
• Treat properties with respect
• Follow house rules set by Hosts
• Not exceed the maximum number of guests specified
• Report any issues or damages promptly
• Leave the property in reasonable condition`,
    },
    {
      title: '7. Prohibited Activities',
      content: `Users may not:
• Use the Platform for any unlawful purpose
• Post false, misleading, or fraudulent content
• Harass, abuse, or harm other users
• Attempt to circumvent our payment system
• Scrape or collect user data without permission`,
    },
    {
      title: '8. Intellectual Property',
      content: `All content on Agribnv, including text, graphics, logos, and software, is the property of Agribnv or its licensors and is protected by intellectual property laws. Users may not copy, modify, or distribute this content without permission.`,
    },
    {
      title: '9. Limitation of Liability',
      content: `Agribnv acts as an intermediary platform and is not liable for:
• The actions or omissions of Hosts or Guests
• The condition or safety of listed properties
• Personal injury or property damage during stays
• Disputes between users`,
    },
    {
      title: '10. Modifications to Terms',
      content: `We reserve the right to modify these Terms at any time. Changes will be effective upon posting to the Platform. Your continued use of Agribnv after changes constitutes acceptance of the modified Terms.`,
    },
    {
      title: '11. Contact Information',
      content: `For questions about these Terms, please contact us at:
• Email: support@agribnv.com
• Address: Guimaras, Philippines`,
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
          <h1 className="text-xl font-bold text-foreground">Terms of Use</h1>
        </div>
      </div>

      <div className="container py-8 max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
              transition={{ delay: index * 0.05 }}
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
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          <p>© 2024 Agribnv. All rights reserved.</p>
        </motion.div>
      </div>
    </Layout>
  );
}
