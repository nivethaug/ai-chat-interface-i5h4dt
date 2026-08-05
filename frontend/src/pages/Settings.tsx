import { useState, useCallback } from "react";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Sliders,
  Bell,
  Palette,
  Check,
  AlertCircle,
  Save,
  Trash2,
  Key,
  Globe,
  Cpu,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface ToastMsg {
  type: "success" | "error";
  message: string;
}

interface ProfileData {
  displayName: string;
  email: string;
  bio: string;
  avatar: string;
}

interface ModelConfig {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  systemPrompt: string;
}

interface SecurityData {
  twoFactor: boolean;
  sessionTimeout: string;
  apiKeysVisible: boolean;
}

interface Preferences {
  theme: string;
  fontSize: string;
  reduceMotion: boolean;
  sendOnEnter: boolean;
  streamResponses: boolean;
  autoScroll: boolean;
}

/* ------------------------------------------------------------------ */
/*  Tab config                                                        */
/* ------------------------------------------------------------------ */

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "model", label: "Model Parameters", icon: Sliders },
  { id: "security", label: "Security", icon: Shield },
  { id: "preferences", label: "Preferences", icon: Palette },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* ------------------------------------------------------------------ */
/*  Field wrapper                                                     */
/* ------------------------------------------------------------------ */

function Field({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-zinc-200">{label}</label>
      {description && <p className="text-xs text-zinc-500">{description}</p>}
      <div className="mt-1">{children}</div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 transition-colors focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30";

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [toast, setToast] = useState<ToastMsg | null>(null);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    displayName: "Alex Chen",
    email: "alex.chen@example.com",
    bio: "Full-stack engineer building AI-powered developer tools.",
    avatar: "AX",
  });

  const [model, setModel] = useState<ModelConfig>({
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.9,
    frequencyPenalty: 0,
    systemPrompt: "You are NexusAI, a helpful and knowledgeable AI assistant. Provide clear, accurate, and well-structured responses.",
  });

  const [security, setSecurity] = useState<SecurityData>({
    twoFactor: true,
    sessionTimeout: "30",
    apiKeysVisible: false,
  });

  const [prefs, setPrefs] = useState<Preferences>({
    theme: "dark",
    fontSize: "medium",
    reduceMotion: false,
    sendOnEnter: true,
    streamResponses: true,
    autoScroll: true,
  });

  const showToast = useCallback((type: ToastMsg["type"], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast("success", "Settings saved successfully");
    }, 800);
  }, [showToast]);

  /* ---------------------------------------------------------------- */
  /*  Renderers                                                       */
  /* ---------------------------------------------------------------- */

  const renderProfile = () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-2xl font-bold text-white shadow-lg shadow-purple-500/30">
          {profile.avatar}
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => showToast("success", "Avatar upload opened")}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-zinc-200 transition-colors hover:bg-white/[0.06]"
          >
            Change Avatar
          </button>
          <button
            onClick={() => showToast("error", "Photo removal requires confirmation")}
            className="text-left text-xs text-zinc-500 transition-colors hover:text-red-400"
          >
            Remove photo
          </button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Display Name" description="Shown in your profile and messages">
          <input
            type="text"
            aria-label="Display name"
            value={profile.displayName}
            onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Email Address" description="Used for notifications and login">
          <input
            type="email"
            aria-label="Email address"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Bio" description="Tell others a bit about yourself">
        <textarea
          aria-label="Bio"
          rows={3}
          value={profile.bio}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          className={cn(inputClass, "resize-none")}
        />
      </Field>
    </div>
  );

  const renderModel = () => (
    <div className="flex flex-col gap-7">
      {/* Temperature */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-zinc-200">Temperature</label>
            <p className="text-xs text-zinc-500">Controls randomness — lower is focused, higher is creative</p>
          </div>
          <span className="rounded-md bg-purple-500/15 px-2.5 py-1 font-mono text-sm font-bold text-purple-300">
            {model.temperature.toFixed(2)}
          </span>
        </div>
        <Slider
          value={[model.temperature]}
          onValueChange={(v) => setModel({ ...model, temperature: v[0] })}
          min={0}
          max={2}
          step={0.05}
          className="py-2"
        />
        <div className="flex justify-between text-[10px] text-zinc-600">
          <span>Precise (0.0)</span>
          <span>Balanced (1.0)</span>
          <span>Creative (2.0)</span>
        </div>
      </div>

      {/* Max Tokens */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-zinc-200">Max Tokens</label>
            <p className="text-xs text-zinc-500">Maximum length of generated responses</p>
          </div>
          <span className="rounded-md bg-purple-500/15 px-2.5 py-1 font-mono text-sm font-bold text-purple-300">
            {model.maxTokens}
          </span>
        </div>
        <Slider
          value={[model.maxTokens]}
          onValueChange={(v) => setModel({ ...model, maxTokens: v[0] })}
          min={256}
          max={8192}
          step={256}
          className="py-2"
        />
        <div className="flex justify-between text-[10px] text-zinc-600">
          <span>256</span>
          <span>4096</span>
          <span>8192</span>
        </div>
      </div>

      {/* Top P */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-zinc-200">Top P (Nucleus Sampling)</label>
            <p className="text-xs text-zinc-500">Filters tokens by cumulative probability</p>
          </div>
          <span className="rounded-md bg-purple-500/15 px-2.5 py-1 font-mono text-sm font-bold text-purple-300">
            {model.topP.toFixed(2)}
          </span>
        </div>
        <Slider
          value={[model.topP]}
          onValueChange={(v) => setModel({ ...model, topP: v[0] })}
          min={0.1}
          max={1}
          step={0.05}
          className="py-2"
        />
      </div>

      {/* Frequency Penalty */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-zinc-200">Frequency Penalty</label>
            <p className="text-xs text-zinc-500">Reduces repetition of the same tokens</p>
          </div>
          <span className="rounded-md bg-purple-500/15 px-2.5 py-1 font-mono text-sm font-bold text-purple-300">
            {model.frequencyPenalty.toFixed(1)}
          </span>
        </div>
        <Slider
          value={[model.frequencyPenalty]}
          onValueChange={(v) => setModel({ ...model, frequencyPenalty: v[0] })}
          min={-2}
          max={2}
          step={0.1}
          className="py-2"
        />
      </div>

      {/* System Prompt */}
      <Field label="System Prompt" description="Defines the AI's default behavior and persona">
        <textarea
          aria-label="System prompt"
          rows={4}
          value={model.systemPrompt}
          onChange={(e) => setModel({ ...model, systemPrompt: e.target.value })}
          className={cn(inputClass, "resize-none font-mono text-xs")}
        />
      </Field>
    </div>
  );

  const renderSecurity = () => (
    <div className="flex flex-col gap-6">
      {/* 2FA */}
      <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
            <Shield className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-200">Two-Factor Authentication</p>
            <p className="text-xs text-zinc-500">Add an extra layer of security to your account</p>
          </div>
        </div>
        <Switch
          checked={security.twoFactor}
          onCheckedChange={(v) => {
            setSecurity({ ...security, twoFactor: v });
            showToast("success", v ? "2FA enabled" : "2FA disabled");
          }}
          aria-label="Toggle two-factor authentication"
        />
      </div>

      {/* Session timeout */}
      <Field label="Session Timeout" description="Automatically log out after inactivity">
        <Select
          value={security.sessionTimeout}
          onValueChange={(v) => setSecurity({ ...security, sessionTimeout: v })}
        >
          <SelectTrigger className="w-full border-white/10 bg-white/[0.03] text-zinc-100">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15">15 minutes</SelectItem>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="60">1 hour</SelectItem>
            <SelectItem value="240">4 hours</SelectItem>
            <SelectItem value="never">Never</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      {/* API Key */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
            <Key className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-200">API Key</p>
            <p className="text-xs text-zinc-500">Use this key to access the NexusAI API</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type={showApiKey ? "text" : "password"}
            readOnly
            aria-label="API key"
            value="nk-prod-9f3a7c2e1b8d4f6a0c5e3b7d9f2a1c8e"
            className={inputClass}
          />
          <button
            onClick={() => setShowApiKey((v) => !v)}
            aria-label={showApiKey ? "Hide API key" : "Show API key"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-400 transition-colors hover:text-zinc-200"
          >
            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            onClick={() => {
              navigator.clipboard?.writeText("nk-prod-9f3a7c2e1b8d4f6a0c5e3b7d9f2a1c8e");
              showToast("success", "API key copied to clipboard");
            }}
            aria-label="Copy API key"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-400 transition-colors hover:text-zinc-200"
          >
            <Key className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-red-500/20 bg-red-500/[0.03] p-4">
        <p className="mb-1 text-sm font-medium text-red-300">Danger Zone</p>
        <p className="mb-3 text-xs text-zinc-500">Permanently delete your account and all associated data</p>
        <button
          onClick={() => showToast("error", "Account deletion requires email confirmation")}
          className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-300 transition-all hover:bg-red-500/20"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete Account
        </button>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="flex flex-col gap-5">
      {[
        { key: "sendOnEnter", label: "Send on Enter", desc: "Press Enter to send messages (Shift+Enter for newline)", icon: Cpu },
        { key: "streamResponses", label: "Stream Responses", desc: "Show AI responses as they are generated", icon: Globe },
        { key: "autoScroll", label: "Auto-Scroll", desc: "Automatically scroll to the latest message", icon: Bell },
        { key: "reduceMotion", label: "Reduce Motion", desc: "Minimize animations and transitions", icon: Palette },
      ].map(({ key, label, desc, icon: Icon }) => (
        <div
          key={key}
          className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <Icon className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">{label}</p>
              <p className="text-xs text-zinc-500">{desc}</p>
            </div>
          </div>
          <Switch
            checked={prefs[key as keyof Preferences] as boolean}
            onCheckedChange={(v) => setPrefs({ ...prefs, [key]: v })}
            aria-label={label}
          />
        </div>
      ))}

      <Field label="Theme" description="Choose your preferred color scheme">
        <Select value={prefs.theme} onValueChange={(v) => setPrefs({ ...prefs, theme: v })}>
          <SelectTrigger className="w-full border-white/10 bg-white/[0.03] text-zinc-100">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dark">Dark (Default)</SelectItem>
            <SelectItem value="midnight">Midnight Blue</SelectItem>
            <SelectItem value="carbon">Carbon Black</SelectItem>
            <SelectItem value="auto">System Auto</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field label="Font Size" description="Adjust the chat interface text size">
        <Select value={prefs.fontSize} onValueChange={(v) => setPrefs({ ...prefs, fontSize: v })}>
          <SelectTrigger className="w-full border-white/10 bg-white/[0.03] text-zinc-100">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium (Default)</SelectItem>
            <SelectItem value="large">Large</SelectItem>
            <SelectItem value="xlarge">Extra Large</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto bg-[#070710]">
      {/* Toast */}
      {toast && (
        <div
          aria-live="assertive"
          className={cn(
            "fixed right-6 top-6 z-50 flex items-center gap-2.5 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl",
            toast.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          )}
        >
          {toast.type === "success" ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/30">
            <SettingsIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-sm text-zinc-500">Manage your account and AI configuration</p>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-white/5 pb-px">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all duration-300",
                activeTab === id
                  ? "border-purple-500 text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Icon className={cn("h-4 w-4", activeTab === id && "text-purple-400")} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.015] p-6 md:p-8">
          {activeTab === "profile" && renderProfile()}
          {activeTab === "model" && renderModel()}
          {activeTab === "security" && renderSecurity()}
          {activeTab === "preferences" && renderPreferences()}
        </div>

        {/* Save / Cancel */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={() => showToast("error", "Changes discarded")}
            className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-500/30 transition-all duration-300 hover:shadow-purple-400/50 hover:brightness-110 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
