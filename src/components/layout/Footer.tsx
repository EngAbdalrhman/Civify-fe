"use client";

import { useRouter } from "next/navigation";
import { AppLogo } from "@/components/app/AppLogo";
import { Button } from "@/components/ui/button";
import {
  Github,
  Twitter,
  Linkedin,
  Mail,
  Heart,
  FileText,
  Shield,
  Key,
  CreditCard,
} from "lucide-react";

export function Footer() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "Dashboard", href: "/dashboard", icon: FileText },
      { name: "Plans & Pricing", href: "/dashboard/plans", icon: CreditCard },
      { name: "API Documentation", href: "/dashboard/api-docs", icon: Key },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Blog", href: "/blog" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "FAQ", href: "/faq" },
      { name: "Status", href: "/status" },
    ],
  };

  const socialLinks = [
    { name: "GitHub", icon: Github, href: "https://github.com" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
    { name: "Email", icon: Mail, href: "mailto:support@hicv.app" },
  ];

  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <AppLogo size="sm" />
            </div>
            <p className="text-sm text-gray-600 mb-4 max-w-sm">
              AI-powered CV tailoring platform that helps you create
              professional, job-specific resumes in minutes. Stand out from the
              crowd with HICv.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <Button
                  key={social.name}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-gray-200"
                  onClick={() => window.open(social.href, "_blank")}
                >
                  <social.icon className="h-4 w-4 text-gray-600" />
                  <span className="sr-only">{social.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm text-gray-600 hover:text-gray-900 font-normal"
                    onClick={() => router.push(link.href)}
                  >
                    {link.name}
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm text-gray-600 hover:text-gray-900 font-normal"
                    onClick={() => router.push(link.href)}
                  >
                    {link.name}
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm text-gray-600 hover:text-gray-900 font-normal"
                    onClick={() => router.push(link.href)}
                  >
                    {link.name}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <p>© {currentYear} Civify. All rights reserved.</p>
              <div className="hidden md:flex items-center gap-4">
                {footerLinks.legal.map((link) => (
                  <Button
                    key={link.name}
                    variant="link"
                    className="h-auto p-0 text-sm text-gray-600 hover:text-gray-900 font-normal"
                    onClick={() => router.push(link.href)}
                  >
                    {link.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1 text-sm text-gray-600">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              <span>by Civify Team</span>
            </div>
          </div>

          {/* Mobile Legal Links */}
          <div className="md:hidden flex flex-wrap justify-center gap-4 mt-4">
            {footerLinks.legal.map((link) => (
              <Button
                key={link.name}
                variant="link"
                className="h-auto p-0 text-sm text-gray-600 hover:text-gray-900 font-normal"
                onClick={() => router.push(link.href)}
              >
                {link.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
