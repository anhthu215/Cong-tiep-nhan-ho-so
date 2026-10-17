import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/landing/hero";
import { QuoteForm } from "@/components/landing/quote-form";
import { Highlights } from "@/components/landing/highlights";
import { Process } from "@/components/landing/process";
import { Faq } from "@/components/landing/faq";
import { ChatWidget } from "@/components/landing/chat-widget";

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Process />
        <QuoteForm />
        <Highlights />
        <Faq />
      </main>
      <SiteFooter />
      <ChatWidget />
    </>
  );
}
