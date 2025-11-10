import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Badge } from "../Components/ui/badge";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from "lucide-react";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { Textarea } from "../Components/ui/textarea";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const BASE_URL = "http://localhost:8000/api/users/send-email";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "jason.kamwaro@strathmore.edu", 
          name: formData.name,
          subject: formData.subject,
          body: `
            <h3>New message from ${formData.name}</h3>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Message:</strong><br>${formData.message}</p>
          `,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to send email");

      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Contact Us
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Have a question or need assistance? We’re here to help. Reach out to 
              the <strong>MyShop</strong> team anytime — we’d love to hear from you.
            </p>
          </header>

          {/* Contact Info Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-primary" />
                Get in Touch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <p className="text-muted-foreground">jason.kamwaro@strathmore.edu</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <p className="text-muted-foreground">+254 700 123 456</p>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <p className="text-muted-foreground">
                  123 Market Street, Nairobi, Kenya
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <p className="text-muted-foreground">Mon – Sat, 8:00 AM – 8:00 PM</p>
              </div>
            </CardContent>
          </Card>

          {/* Message Form Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Send className="w-6 h-6 text-primary" />
                Send Us a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    name="email"
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <Input
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
                <Textarea
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
                <Button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full md:w-auto"
                >
                  {status === "loading" ? "Sending..." : "Send Message"}
                </Button>
              </form>

              {/* Feedback Messages */}
              {status === "success" && (
                <p className="text-green-600 mt-3">✅ Email sent successfully!</p>
              )}
              {status === "error" && (
                <p className="text-red-600 mt-3">❌ {errorMsg}</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Contact Badges */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Badge variant="outline" className="py-2 px-3">
              <Phone className="w-4 h-4 mr-2" />
              Call Us Anytime
            </Badge>
            <Badge variant="outline" className="py-2 px-3">
              <Mail className="w-4 h-4 mr-2" />
              Quick Email Support
            </Badge>
            <Badge variant="outline" className="py-2 px-3">
              <MapPin className="w-4 h-4 mr-2" />
              Visit Our Store
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
