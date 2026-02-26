import { useState } from "react";
import { useSettingsStore } from "../store/useSettingsStore";

function Settings() {
  const {
    apiKey,
    mpan,
    serial,
    agilePlanVersion,
    region,
    ofgemCapRate,
    notificationsEnabled,
    updateSettings,
    resetToDefaults,
  } = useSettingsStore();

  const [form, setForm] = useState({
    apiKey,
    mpan,
    serial,
    agilePlanVersion,
    region,
    ofgemCapRate: String(ofgemCapRate),
  });
  const [saved, setSaved] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const { ofgemCapRate: capStr, ...rest } = form;
    updateSettings({ ...rest, ofgemCapRate: parseFloat(capStr) || 0 });
    setSaved(true);
  };

  const handleNotifToggle = async () => {
    setNotifError(null);
    if (notificationsEnabled) {
      updateSettings({ notificationsEnabled: false });
      return;
    }
    if (!("Notification" in window)) {
      setNotifError("Notifications are not supported in this browser.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      updateSettings({ notificationsEnabled: true });
    } else {
      setNotifError(
        "Notification permission denied. Please allow notifications in your browser settings.",
      );
    }
  };

  const handleReset = () => {
    resetToDefaults();
    const defaults = useSettingsStore.getState();
    setForm({
      apiKey: defaults.apiKey,
      mpan: defaults.mpan,
      serial: defaults.serial,
      agilePlanVersion: defaults.agilePlanVersion,
      region: defaults.region,
      ofgemCapRate: String(defaults.ofgemCapRate),
    });
    setSaved(false);
  };

  const fields = [
    {
      key: "apiKey",
      label: "API Key",
      type: "password",
      placeholder: "sk_live_...",
    },
    {
      key: "mpan",
      label: "MPAN",
      type: "text",
      placeholder: "e.g. 1234567890123",
    },
    {
      key: "serial",
      label: "Serial Number",
      type: "text",
      placeholder: "e.g. 12A3456789",
    },
    {
      key: "agilePlanVersion",
      label: "Agile Plan Version",
      type: "text",
      placeholder: "e.g. AGILE-FLEX-22-11-25",
    },
    {
      key: "region",
      label: "Region (GSP)",
      type: "text",
      placeholder: "e.g. H",
    },
    {
      key: "ofgemCapRate",
      label: "Ofgem Price Cap (p/kWh)",
      type: "number",
      placeholder: "e.g. 24.50",
    },
  ] as const;

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Settings</h2>
      <form onSubmit={handleSave} className="space-y-4">
        {fields.map(({ key, label, type, placeholder }) => (
          <div key={key}>
            <label
              htmlFor={key}
              className="mb-1 block text-sm font-medium text-slate-300"
            >
              {label}
            </label>
            <input
              id={key}
              type={type}
              value={form[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={placeholder}
              className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        ))}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-500"
          >
            Reset to Defaults
          </button>
        </div>
        {saved && <p className="text-sm text-green-400">Settings saved.</p>}
      </form>

      {/* Notification toggle */}
      <div className="mt-6 border-t border-slate-700 pt-6">
        <h3 className="mb-3 text-lg font-semibold">Notifications</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-300">
              Negative Price Alerts
            </p>
            <p className="text-xs text-slate-500">
              Get notified when a negative-price slot begins
            </p>
          </div>
          <button
            type="button"
            onClick={handleNotifToggle}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              notificationsEnabled ? "bg-purple-600" : "bg-slate-600"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                notificationsEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
        {notifError && (
          <p className="mt-2 text-sm text-red-400">{notifError}</p>
        )}
      </div>
    </div>
  );
}

export default Settings;
