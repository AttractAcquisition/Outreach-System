import { Link } from "react-router-dom";
import { ArrowRight, MessageSquare } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground mb-6">
            <span className="h-2 w-2 rounded-full bg-success" />
            Operator Panel · v1
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Attract Acquisition
            <span className="block bg-gradient-brand bg-clip-text text-transparent">
              Operator Command Center
            </span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground max-w-xl">
            Manage WhatsApp API outreach, inbound leads, AI-assisted conversations, approvals, templates and compliance — all from one place.
          </p>

          <div className="mt-8 grid gap-3 max-w-md">
            <Link
              to="/whatsapp"
              className="group flex items-center justify-between rounded-2xl border border-border bg-card/60 p-4 hover:border-accent/50 hover:bg-card transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-brand grid place-items-center shadow-glow">
                  <MessageSquare className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold">WhatsApp Command Center</p>
                  <p className="text-xs text-muted-foreground">
                    Inbox, outreach queue, templates, leads, compliance
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
