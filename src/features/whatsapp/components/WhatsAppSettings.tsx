import { Settings } from "lucide-react";
import { EmptyState } from "./EmptyState";

export function WhatsAppSettings() {
  // TODO: Connect WhatsApp settings to a real integration settings table or secure backend endpoint.
  return (
    <EmptyState
      icon={Settings}
      title="No settings data source"
      description="WhatsApp connection settings are not connected to a backend yet."
    />
  );
}
