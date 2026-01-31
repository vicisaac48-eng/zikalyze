import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, MessageSquare, Send, TrendingUp, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000, "Message must be less than 5000 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ContactFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: result.data,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Message sent! We'll get back to you as soon as possible.");
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("Failed to send message. Please try again later or email us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
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

        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="flex flex-col items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Message Sent!</h1>
            <p className="text-muted-foreground max-w-md">
              Thank you for reaching out. We've received your message and will get back to you within 24-48 hours.
            </p>
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to <span className="text-primary">{formData.email}</span>
            </p>
            <div className="flex gap-4 mt-4">
              <Button asChild>
                <Link to="/">Return Home</Link>
              </Button>
              <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                Send Another Message
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contact Us</h1>
            <p className="text-sm text-muted-foreground">We'd love to hear from you</p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-5">
          {/* Contact Info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Get in Touch</h2>
              <p className="text-muted-foreground">
                Have a question, feedback, or need support? Fill out the form and we'll respond as soon as possible.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Email</p>
                  <a 
                    href="mailto:privacyzikalyze@gmail.com" 
                    className="text-sm text-primary hover:underline"
                  >
                    privacyzikalyze@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Response Time</p>
                  <p className="text-sm text-muted-foreground">Usually within 24-48 hours</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm text-muted-foreground">
                For urgent security concerns, please include "SECURITY" in your subject line for priority handling.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={errors.name ? "border-destructive" : ""}
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={errors.email ? "border-destructive" : ""}
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="How can we help?"
                  value={formData.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  className={errors.subject ? "border-destructive" : ""}
                  disabled={isSubmitting}
                />
                {errors.subject && (
                  <p className="text-xs text-destructive">{errors.subject}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us more about your inquiry..."
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  className={`min-h-[150px] resize-none ${errors.message ? "border-destructive" : ""}`}
                  disabled={isSubmitting}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  {errors.message ? (
                    <p className="text-destructive">{errors.message}</p>
                  ) : (
                    <span>Minimum 10 characters</span>
                  )}
                  <span>{formData.message.length}/5000</span>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
          <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <span>•</span>
          <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          <span>•</span>
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        </div>
      </main>
    </div>
  );
};

export default Contact;
