"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactContent() {
  const t = useTranslations("contact");
  const [formData, setFormData] = useState({
    "Contact Name": "",
    Email: "",
    Subject: "",
    Description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    // Simple validation before submission
    if (
      !formData["Contact Name"] ||
      !formData["Email"] ||
      !formData["Subject"] ||
      !formData["Description"]
    ) {
      e.preventDefault();
      // You might want to show an error message here if needed,
      // but the 'required' attributes on inputs usually handle this.
      return;
    }

    setIsSubmitting(true);

    // Since we are submitting to an iframe, we can't easily know when it's done cross-origin.
    // We will assume success after a short delay and show the toast.
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(t("form.success"));
      setFormData({
        "Contact Name": "",
        Email: "",
        Subject: "",
        Description: "",
      });
    }, 1000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-card p-6 rounded-lg shadow-sm border space-y-4">
              <div className="flex items-start space-x-4">
                <MapPin className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {t("info.address")}
                  </h3>
                  <p className="text-sm text-muted-foreground">Cairo, Egypt</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Mail className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {t("info.email")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    support@civify.com
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {t("info.phone")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    +20 01108992027
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <iframe name="hidden_iframe" style={{ display: "none" }} />
              <form
                action="https://desk.zoho.com/support/WebToCase"
                method="POST"
                target="hidden_iframe"
                onSubmit={handleSubmit}
                className="space-y-6"
                encType="multipart/form-data"
              >
                <input
                  type="hidden"
                  name="xnQsjsdp"
                  value="edbsn2e154c5c86be9ce8f4b23d5d0c28f6b1"
                />
                <input
                  type="hidden"
                  name="xmIwtLD"
                  value="edbsn4c64b6b33a28e1868c82c07130fb7aa37f8930026275a13a01f00b7be4dbed61"
                />
                <input type="hidden" name="xJdfEaS" value="" />
                <input type="hidden" name="actionType" value="Q2FzZXM=" />
                <input type="hidden" id="property(module)" value="Cases" />
                <input
                  type="hidden"
                  name="returnURL"
                  value="https://civify.cv"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {t("form.name")}
                    </label>
                    <Input
                      id="name"
                      name="Contact Name"
                      value={formData["Contact Name"]}
                      onChange={handleChange}
                      required
                      placeholder={t("form.name")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {t("form.email")}
                    </label>
                    <Input
                      id="email"
                      name="Email"
                      type="email"
                      value={formData["Email"]}
                      onChange={handleChange}
                      required
                      placeholder={t("form.email")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="subject"
                    className="text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t("form.subject")}
                  </label>
                  <Input
                    id="subject"
                    name="Subject"
                    value={formData["Subject"]}
                    onChange={handleChange}
                    required
                    placeholder={t("form.subject")}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t("form.message")}
                  </label>
                  <Textarea
                    id="message"
                    name="Description"
                    value={formData["Description"]}
                    onChange={handleChange}
                    required
                    placeholder={t("form.message")}
                    rows={6}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("form.sending") : t("form.submit")}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
