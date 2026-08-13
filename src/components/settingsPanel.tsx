'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  Clock3,
  Globe2,
  LockKeyhole,
  MonitorCog,
  ShieldAlert,
  UserRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type SectionId =
  | 'business'
  | 'booking'
  | 'hours'
  | 'notifications'
  | 'booking-page'
  | 'account'
  | 'danger';

const SECTIONS: {
  id: SectionId;
  label: string;
  description: string;
  icon: typeof Building2;
}[] = [
  {
    id: 'business',
    label: 'Business',
    description: 'Business details, contact information and timezone',
    icon: Building2,
  },
  {
    id: 'booking',
    label: 'Booking',
    description: 'Booking rules, cancellations and rescheduling',
    icon: CalendarDays,
  },
  {
    id: 'hours',
    label: 'Working hours',
    description: 'Your business operating hours',
    icon: Clock3,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Customer and staff booking notifications',
    icon: Bell,
  },
  {
    id: 'booking-page',
    label: 'Booking page',
    description: 'Control what customers see when they book',
    icon: Globe2,
  },
  {
    id: 'account',
    label: 'Account & security',
    description: 'Owner account and security settings',
    icon: LockKeyhole,
  },
  {
    id: 'danger',
    label: 'Danger zone',
    description: 'Permanent and destructive actions',
    icon: ShieldAlert,
  },
];

function ComingSoonBadge() {
  return (
    <span className='ml-2 rounded-full bg-stone-soft px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-ink-soft'>Coming soon</span>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        disabled ? 'cursor-not-allowed opacity-40' : ''
        } ${checked ? 'bg-moss' : 'bg-stone'
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
          checked ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  );
}


function SectionHeader({
            title,
            description,
          }: {
            title: string;
            description: string;
          }) {
            return (
              <div className="mb-5 border-b border-stone-soft pb-4">
                <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-1 max-w-2xl text-[11px] leading-4 text-ink-soft">
                  {description}
                </p>
              </div>
            );
          }

function SettingRow({
  title,
  description,
  children,
  comingSoon,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  comingSoon?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-stone-soft py-4 last:border-b-0">
      <div className="min-w-0">
        <div className="flex items-center text-xs font-semibold text-ink">
          {title}
          {comingSoon && <ComingSoonBadge />}
        </div>
        {description && (
          <div className="mt-1 max-w-md text-[11px] leading-4 text-ink-soft">
            {description}
          </div>
        )}
      </div>
      <div className={comingSoon ? 'opacity-60' : ''}>{children}</div>
    </div>
  );
}

export default function SettingsPanel({
  tenantName,
  subdomain,
  timezone,
}: {
  tenantName: string;
  subdomain: string;
  timezone: string;
}) {
  const [activeSection, setActiveSection] = useState<SectionId>('business');
  const [mobileOpen, setMobileOpen] = useState(false);

  const [name, setName] = useState(tenantName);
  const [tz, setTz] = useState(timezone);
  const [submitting, setSubmitting] = useState(false);

  const timezones = useMemo(() => {
    try {
      return Intl.supportedValuesOf('timeZone');
    } catch {
      return [timezone];
    }
  }, [timezone]);

  const active = SECTIONS.find((section) => section.id === activeSection)!;

  async function handleBusinessSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/tenant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, timezone: tz }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? 'Could not save settings');
        return;
      }

      toast.success('Business settings saved');
    } finally {
      setSubmitting(false);
    }
  }

  function selectSection(id: SectionId) {
    setActiveSection(id);
    setMobileOpen(false);
  }

  function renderSection() {
    switch (activeSection) {
      case 'business':
        return (
          <form onSubmit={handleBusinessSubmit} className="space-y-5">
                      <SectionHeader
                        title="Business details"
                        description="Information used across your dashboard and booking experience."
                      />
          
                      <div className="space-y-5">
                        <label className="block">
                          <span className="text-xs font-semibold text-ink">Business name</span>
                          <input
                            required
                            className="input mt-1"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </label>
          
                        <div>
                          <span className="text-xs font-semibold text-ink">
                            Booking page address
                          </span>
                          <div className="mt-1">
                            <span className="inline-flex rounded-md border border-stone bg-stone-soft px-3 py-2 font-mono text-[13px] text-ink-soft">
                              {subdomain}
                            </span>
                          </div>
                          <span className="mt-1 block text-[11px] leading-4 text-ink-soft">
                            Contact support to change this — it is tied to your booking links
                            and existing confirmation emails.
                          </span>
                        </div>
          
                        <label className="block">
                          <span className="text-xs font-semibold text-ink">Timezone</span>
                          <select
                            className="input mt-1"
                            value={tz}
                            onChange={(e) => setTz(e.target.value)}
                          >
                            {timezones.map((z) => (
                              <option key={z} value={z}>
                                {z}
                              </option>
                            ))}
                          </select>
                          <span className="mt-1 block text-[11px] leading-4 text-ink-soft">
                            Used for staff schedules, booking times and appointment
                            notifications.
                          </span>
                        </label>
          
                        {/* Fixed: previously an uncontrolled input with a
                            discarding onChange -- typing here looked like it
                            worked, and hitting "Save changes" showed a success
                            toast even though nothing was sent anywhere. Now
                            disabled and clearly labeled instead of silently
                            swallowing input. */}
                        <label className="block opacity-60">
                          <span className="flex items-center text-xs font-semibold text-ink">
                            Business email
                            <ComingSoonBadge />
                          </span>
                          <input
                            type="email"
                            disabled
                            placeholder="hello@business.com"
                            className="input mt-1 cursor-not-allowed"
                          />
                          <span className="mt-1 block text-[11px] text-ink-soft">
                            Not available yet — will be used for business communication and
                            notifications once connected.
                          </span>
                        </label>
          
                        <label className="block opacity-60">
                          <span className="flex items-center text-xs font-semibold text-ink">
                            Business phone
                            <ComingSoonBadge />
                          </span>
                          <input
                            type="tel"
                            disabled
                            placeholder="+234 800 000 0000"
                            className="input mt-1 cursor-not-allowed"
                          />
                        </label>
                      </div>
          
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="rounded-md bg-moss px-4 py-2 text-xs font-semibold text-white hover:bg-moss-dark disabled:opacity-50"
                      >
                        {submitting ? 'Saving…' : 'Save changes'}
                      </Button>
                    </form>
                  );
          
                case 'booking':
                  return (
                    <div>
                      <SectionHeader
                        title="Booking settings"
                        description="Control how customers can create, cancel and reschedule appointments."
                      />
          
                      <div className="divide-y divide-stone-soft">
                        <SettingRow
                          title="Online bookings"
                          description="Allow customers to book appointments from your public booking page."
                          comingSoon
                        >
                          <Toggle checked={true} onChange={() => undefined} label="Online bookings" disabled />
                        </SettingRow>
          
                        <SettingRow
                          title="Same-day bookings"
                          description="Allow customers to book an appointment on the current day."
                          comingSoon
                        >
                          <Toggle checked={true} onChange={() => undefined} label="Same-day bookings" disabled />
                        </SettingRow>
          
                        <SettingRow
                          title="Minimum booking notice"
                          description="How much notice customers need before booking."
                          comingSoon
                        >
                          <select className="input w-32 cursor-not-allowed" defaultValue="2 hours" disabled>
                            <option>30 minutes</option>
                            <option>1 hour</option>
                            <option>2 hours</option>
                            <option>4 hours</option>
                            <option>1 day</option>
                          </select>
                        </SettingRow>
          
                        <SettingRow
                          title="Advance booking limit"
                          description="How far into the future customers can make bookings."
                          comingSoon
                        >
                          <select className="input w-32 cursor-not-allowed" defaultValue="30 days" disabled>
                            <option>7 days</option>
                            <option>14 days</option>
                            <option>30 days</option>
                            <option>60 days</option>
                            <option>90 days</option>
                          </select>
                        </SettingRow>
          
                        <SettingRow
                          title="Buffer between bookings"
                          description="Add a short gap between appointments."
                          comingSoon
                        >
                          <select className="input w-32 cursor-not-allowed" defaultValue="10 minutes" disabled>
                            <option>None</option>
                            <option>5 minutes</option>
                            <option>10 minutes</option>
                            <option>15 minutes</option>
                            <option>30 minutes</option>
                          </select>
                        </SettingRow>
          
                        <SettingRow
                          title="Customer cancellation"
                          description="Allow customers to cancel their own appointments."
                          comingSoon
                        >
                          <Toggle checked={true} onChange={() => undefined} label="Customer cancellation" disabled />
                        </SettingRow>
          
                        <SettingRow
                          title="Customer rescheduling"
                          description="Allow customers to move their appointment to another available time."
                          comingSoon
                        >
                          <Toggle checked={true} onChange={() => undefined} label="Customer rescheduling" disabled />
                        </SettingRow>
                      </div>
                    </div>
                  );
          
                case 'hours':
                  return (
                    <div>
                      <SectionHeader
                        title="Working hours"
                        description="Set the default operating hours for the business. Individual staff schedules can be managed from Staff."
                      />
          
                      <div className="mb-4 flex items-start gap-2 rounded-lg border border-stone-soft bg-stone-soft/40 p-3">
                        <ComingSoonBadge />
                        <p className="text-[11px] leading-4 text-ink-soft">
                          Business-wide default hours aren&rsquo;t connected yet. Availability is
                          currently controlled per staff member in the Staff tab — that&rsquo;s
                          what clients actually book against.
                        </p>
                      </div>
          
                      <div className="space-y-2 opacity-60">
                        {[
                          ['Monday', '09:00', '18:00', true],
                          ['Tuesday', '09:00', '18:00', true],
                          ['Wednesday', '09:00', '18:00', true],
                          ['Thursday', '09:00', '18:00', true],
                          ['Friday', '09:00', '19:00', true],
                          ['Saturday', '09:00', '17:00', true],
                          ['Sunday', '09:00', '17:00', false],
                        ].map(([day, from, to, open]) => (
                          <div
                            key={day as string}
                            className="flex items-center gap-2 rounded-lg border border-stone-soft p-3"
                          >
                            <div className="w-20 text-xs font-semibold text-ink">{day}</div>
                            <select className="input flex-1 cursor-not-allowed" defaultValue={open ? String(from) : 'Closed'} disabled>
                              <option>Closed</option>
                              <option>08:00</option>
                              <option>09:00</option>
                              <option>10:00</option>
                            </select>
                            <span className="text-xs text-ink-soft">to</span>
                            <select className="input flex-1 cursor-not-allowed" defaultValue={open ? String(to) : 'Closed'} disabled>
                              <option>Closed</option>
                              <option>17:00</option>
                              <option>18:00</option>
                              <option>19:00</option>
                              <option>20:00</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
          
                case 'notifications':
                  return (
                    <div>
                      <SectionHeader
                        title="Notifications"
                        description="Choose which booking events should trigger customer and staff notifications."
                      />
          
                      <div className="mb-2 flex items-start gap-2 rounded-lg border border-stone-soft bg-stone-soft/40 p-3">
                        <p className="text-[11px] leading-4 text-ink-soft">
                          Booking confirmations and reminders are already sent automatically —
                          the toggles below for adjusting or disabling them aren&rsquo;t connected
                          yet.
                        </p>
                      </div>
          
                      <div className="divide-y divide-stone-soft">
                        <SettingRow
                          title="Booking confirmation"
                          description="Send customers a confirmation after a booking is created."
                          comingSoon
                        >
                          <Toggle checked={true} onChange={() => undefined} label="Booking confirmation" disabled />
                        </SettingRow>
          
                        <SettingRow
                          title="Appointment reminder"
                          description="Send customers a reminder before their appointment."
                          comingSoon
                        >
                          <Toggle checked={true} onChange={() => undefined} label="Appointment reminder" disabled />
                        </SettingRow>
          
                        <SettingRow
                          title="New booking for staff"
                          description="Notify the assigned staff member when a new booking arrives."
                          comingSoon
                        >
                          <Toggle checked={true} onChange={() => undefined} label="New booking for staff" disabled />
                        </SettingRow>
          
                        <SettingRow
                          title="Reminder timing"
                          description="How long before an appointment the reminder should be sent. Currently fixed at 24 hours for every business."
                          comingSoon
                        >
                          <select className="input w-32 cursor-not-allowed" defaultValue="24 hours" disabled>
                            <option>2 hours</option>
                            <option>4 hours</option>
                            <option>24 hours</option>
                            <option>48 hours</option>
                          </select>
                        </SettingRow>
                      </div>
                    </div>
                  );
          
                case 'booking-page':
                  return (
                    <div>
                      <SectionHeader
                        title="Booking page"
                        description="Control the information customers see on your public booking page."
                      />
          
                      <div className="divide-y divide-stone-soft">
                        <SettingRow
                          title="Show staff selection"
                          description="Let customers choose which staff member they want to book. Currently shown automatically whenever a service has more than one qualified staff member."
                          comingSoon
                        >
                          <Toggle checked={true} onChange={() => undefined} label="Show staff selection" disabled />
                        </SettingRow>
          
                        <SettingRow
                          title="Show service prices"
                          description="Display service prices before the customer books."
                          comingSoon
                        >
                          <Toggle checked={true} onChange={() => undefined} label="Show service prices" disabled />
                        </SettingRow>
          
                        <SettingRow
                          title="Show service duration"
                          description="Display the expected appointment duration."
                          comingSoon
                        >
                          <Toggle checked={true} onChange={() => undefined} label="Show service duration" disabled />
                        </SettingRow>
          
                        <div className="mt-5 rounded-lg border border-stone-soft bg-stone-soft/40 p-4">
                          <div className="flex items-start gap-3">
                            <MonitorCog size={18} className="mt-0.5 shrink-0 text-moss" />
                            <div>
                              <div className="text-xs font-semibold text-ink">
                                Booking page preview
                              </div>
                              <p className="mt-1 text-[11px] leading-4 text-ink-soft">
                                Your public booking page is available at{' '}
                                <span className="font-mono">{subdomain}.app.com</span>.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
          
                case 'account':
                  return (
                    <div>
                      <SectionHeader
                        title="Account & security"
                        description="Owner-only account controls. Staff members do not have access to this area."
                      />
          
                      <div className="space-y-4">
                        <div className="rounded-lg border border-stone-soft p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-soft">
                              <UserRound size={17} className="text-moss" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-ink">Business owner</div>
                              <div className="text-[11px] text-ink-soft">
                                Owner account controls
                              </div>
                            </div>
                          </div>
                        </div>
          
                        <SettingRow
                          title="Change password"
                          description="Update the password used to access the owner account."
                          comingSoon
                        >
                          <Button
                            type="button"
                            variant="outline"
                            disabled
                            className="h-9 cursor-not-allowed rounded-md px-3 text-xs opacity-60"
                          >
                            Change
                          </Button>
                        </SettingRow>
          
                        <SettingRow
                          title="Two-factor authentication"
                          description="Add an extra security layer to the owner account."
                          comingSoon
                        >
                          <span className="rounded-full bg-stone-soft px-2.5 py-1 text-[10px] font-semibold text-ink-soft">
                            Not configured
                          </span>
                        </SettingRow>
          
                        <SettingRow
                          title="Active sessions"
                          description="Review and sign out of devices currently using your account."
                          comingSoon
                        >
                          <Button
                            type="button"
                            variant="outline"
                            disabled
                            className="h-9 cursor-not-allowed rounded-md px-3 text-xs opacity-60"
                          >
                            Manage
                          </Button>
                        </SettingRow>
                      </div>
                    </div>
                  );
          
                case 'danger':
                  return (
                    <div>
                      <SectionHeader
                        title="Danger zone"
                        description="These actions can permanently affect your business data."
                      />
          
                      <div className="rounded-lg border border-rust/30 bg-rust/5 p-4">
                        <div className="flex items-start gap-3">
                          <ShieldAlert size={19} className="mt-0.5 shrink-0 text-rust" />
                          <div className="min-w-0">
                            <div className="flex items-center">
                              <h3 className="text-sm font-semibold text-ink">Delete business</h3>
                              <ComingSoonBadge />
                            </div>
                            <p className="mt-1 text-[11px] leading-4 text-ink-soft">
                              Permanently delete the business, bookings, staff relationships
                              and associated data. This action cannot be undone.
                            </p>
          
                            <Button
                              type="button"
                              disabled
                              className="mt-4 cursor-not-allowed rounded-md border border-rust/40 bg-transparent px-3 py-2 text-xs font-semibold text-rust opacity-60"
                            >
                              Delete business
                            </Button>
                            <p className="mt-2 text-[10px] text-ink-soft">
                              Disabled until a protected server-side deletion flow (with
                              cascade handling and a confirmation step) is built.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
              }
            }
          
            return (
              <div className="w-full max-w-5xl">
                <div className="mb-6">
                  <h2 className="font-display text-2xl font-semibold text-ink">Settings</h2>
                  <p className="mt-1 text-xs text-ink-soft">
                    Owner controls for your business, bookings and customer experience.
                  </p>
                </div>
          
                {/* Mobile section selector */}
                <div className="mb-4 md:hidden">
                  <button
                    type="button"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="flex w-full items-center justify-between rounded-lg border border-stone bg-paper-raised p-3 text-left"
                  >
                    <div className="flex items-center gap-3">
                      {(() => {
                        const ActiveIcon = active.icon;
                        return <ActiveIcon size={18} className="text-moss" />;
                      })()}
                      <div>
                        <div className="text-xs font-semibold text-ink">{active.label}</div>
                        <div className="text-[10px] text-ink-soft">{active.description}</div>
                      </div>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`text-ink-soft transition ${
                        mobileOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
          
                  {mobileOpen && (
                    <div className="mt-2 overflow-hidden rounded-lg border border-stone bg-paper-raised">
                      {SECTIONS.map((section) => {
                        const Icon = section.icon;
                        const selected = section.id === activeSection;
          
                        return (
                          <button
                            key={section.id}
                            type="button"
                            onClick={() => selectSection(section.id)}
                            className={`flex w-full items-center gap-3 border-b border-stone-soft px-3 py-3 text-left last:border-b-0 ${
                              selected ? 'bg-stone-soft' : 'hover:bg-stone-soft/50'
                            }`}
                          >
                            <Icon size={17} className={selected ? 'text-moss' : 'text-ink-soft'} />
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-ink">{section.label}</div>
                              <div className="mt-0.5 text-[10px] leading-4 text-ink-soft">
                                {section.description}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
          
                <div className="grid gap-5 md:grid-cols-[210px_minmax(0,1fr)]">
                  {/* Desktop settings navigation */}
                  <aside className="hidden md:block">
                    <div className="sticky top-5 rounded-lg border border-stone bg-paper-raised p-2">
                      {SECTIONS.map((section) => {
                        const Icon = section.icon;
                        const selected = section.id === activeSection;
          
                        return (
                          <button
                            key={section.id}
                            type="button"
                            onClick={() => selectSection(section.id)}
                            className={`flex w-full items-start gap-2.5 rounded-md px-3 py-2.5 text-left transition ${
                              selected
                                ? 'bg-stone-soft text-ink'
                                : 'text-ink-soft hover:bg-stone-soft/60'
                            }`}
                          >
                            <Icon
                              size={16}
                              className={`mt-0.5 shrink-0 ${
                                selected ? 'text-moss' : 'text-ink-soft'
                              }`}
                            />
                            <span className="text-[11px] font-medium">{section.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </aside>
          
                  {/* Active settings panel */}
                  <section className="min-w-0 rounded-lg border border-stone bg-paper-raised p-4 sm:p-5">
                    {renderSection()}
                  </section>
                </div>
              </div>
            );
          }