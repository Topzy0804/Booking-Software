"use client";

import { useState } from "react";
import {
  CheckCircle2, 
  Clock3, 
  MoreHorizontal, 
  Search, 
  UserRound,
  Users,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import EmptyState from "./emptyState";
import type { Resource, Service } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

const WEEKDAYS = [
  { value: 1, label: "Mond" },
  { value: 2, label: "Tues" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thurs" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

const DEFAULT_DAYS = [1, 2, 3, 4, 5];
const DEFAULT_START = '09:00';
const DEFAULT_END = '17:00';

type WorkingHourEntry = { dayOfWeek: number; startTime: string; endTime: string;};

type ResourceWithDetails = Resource & {
  email?: string;
  CanViewAllBookings?: boolean;
  serviceIds?: string[];
  workingHours?: WorkingHourEntry[];
};


export default function StaffPanel({
  initialResources,
  services,
}: {
  initialResources: ResourceWithDetails[];
  services: Service[];
}) {
  const [resources, setResources] = useState(initialResources);
  const [showForm, setShowForm] = useState(initialResources.length === 0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingEditingId, setLoadingEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [staffFilter, setStaffFilter] = useState<"all" | "active" | "inactive">("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [submitting, setSubmitting] = useState(false);

  const [canViewAllBookings, setCanViewAllBookings] = useState(false);

  function toggleDay(d: number) {
    setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));
  }
  function toggleService(id: string) {
    setSelectedServiceIds((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    );
  }

  function resetForm() {
    setName('');
    setEmail('');
    setSelectedServiceIds([]);
    setDays(DEFAULT_DAYS);
    setStartTime(DEFAULT_START);
    setEndTime(DEFAULT_END);
    setCanViewAllBookings(false);
  }

  function openAddForm() {
    setEditingId(null);
    resetForm();
    setShowForm(true);
  }

  async function openEditForm(r: ResourceWithDetails) {
    setLoadingEditingId(r.id);
    try {
      const res = await fetch(`/api/resources/${r.id}`);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Couldn't load that staff member");
        return;
      }

      const resource = data.resource as ResourceWithDetails;
      setEditingId(resource.id);
      setName(resource.name);
      setEmail(resource.email ?? '');
      setSelectedServiceIds(resource.serviceIds ?? []);
      if (resource.workingHours && resource.workingHours.length > 0) {
        setDays(resource.workingHours.map((h) => h.dayOfWeek));
        setStartTime(resource.workingHours[0].startTime);
        setEndTime(resource.workingHours[0].endTime);
      } else {
        setDays([]);
        setStartTime(DEFAULT_START);
        setEndTime(DEFAULT_END);
      }
      setShowForm(true);
    } finally {
      setLoadingEditingId(null);
    }
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(editingId ? `/api/resources/${editingId}` : "/api/resources", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          serviceIds: selectedServiceIds,
          workingHours: { startTime, endTime, days },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Couldn't add that staff member");
        return;
      }
      if (editingId) {
        setResources((cur) => cur.map((r) => (r.id === editingId ? data.resource : r)));
        toast.success('Staff member updated');
      } else {
        setResources((cur) => [...cur, data.resource]);
        toast.success('Staff member added');
      }
      closeForm();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate(r: ResourceWithDetails) {
    if (!confirm(`remove ${r.name} from staff? they won\'t be able to receive bookings anymore.`)) return;
    const res = await fetch(`/api/resources/${r.id}`, { 
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: false })
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Couldn't remove that staff member");
      return;
    }
    setResources((cur) => cur.map((resource) => (resource.id === r.id ? { ...resource, isActive: false } : resource)));
    toast.success('Staff member deactivated');
  }

  return (
  <div>
           <div className="mb-6">
             <div className="flex items-start justify-between gap-4">
               <div>
                 <div className="flex items-center gap-2">
                   <h2 className="font-display text-2xl font-semibold text-ink">Staff</h2>
                   <span className="rounded-full bg-stone-soft px-2 py-0.5 text-[10px] font-semibold text-ink-soft">
                     {resources.length} {resources.length === 1 ? "member" : "members"}
                   </span>
                 </div>
                 <p className="mt-1 text-[13px] text-ink-soft">
                   Who clients can book, and when they are available.
                 </p>
               </div>
               {!showForm && (
                 <Button onClick={openAddForm} className="shrink-0 rounded-md border border-stone px-3.5 py-2 text-[13px] font-medium text-ink hover:bg-stone-soft">
                   + Add staff
                 </Button>
               )}
             </div>
             {!showForm && resources.length > 0 && (
               <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                 <div className="relative w-full  sm:max-w-xs">
                   <Search size={15} className="pointer-events-none absolute left-70 top-1/2 -translate-y-1/2 text-ink-soft" />
                   <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search staff..." className="input pl-5" aria-label="Search staff" />
                 </div>
                 <div className="flex rounded-lg border border-stone bg-paper-raised p-1">
                   {(["all", "active", "inactive"] as const).map((filter) => (
                     <button key={filter} type="button" onClick={() => setStaffFilter(filter)} className={`rounded-md px-3 py-1.5 text-[11px] font-medium capitalize ${staffFilter === filter ? "bg-stone-soft text-ink" : "text-ink-soft hover:text-ink"}`}>
                       {filter}
                     </button>
                   ))}
                 </div>
               </div>
             )}
           </div>
  
           {showForm && (
             <form
               onSubmit={handleSubmit}
               className="mb-6 space-y-4 rounded-lg border border-stone bg-paper-raised p-5"
             >
               <label className="block max-w-sm">
                 <span className="text-[12px] font-semibold text-ink">Name</span>
                 <input
                   required
                   className="input"
                   placeholder="Sam Rivera"
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                 />
               </label>
  
               <label className="block max-w-sm">
                <span className="text-[12px] font-semibold text-ink">Email</span>
    <input
      required={!editingId}
      disabled={!!editingId}
      type="email"
      className="input"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
  </label>
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={canViewAllBookings}
      onChange={(e) => setCanViewAllBookings(e.target.checked)}
    />
    <span className="text-[12px] font-semibold text-ink">Can see every staff booking</span>
  </label>
     
               {services.length > 0 && (
                 <div>
                   <span className="text-[12px] font-semibold text-ink">Can perform</span>
                   <div className="mt-1.5 flex flex-wrap gap-2">
                     {services.map((s) => (
                       <Button
                         type="button"
                         key={s.id}
                         onClick={() => toggleService(s.id)}
                         className={`rounded-full border px-3 py-1 text-[12px] ${
                           selectedServiceIds.includes(s.id)
                             ? "border-moss bg-moss text-white"
                             : "border-stone text-ink-soft"
                         }`}
                       >
                         {s.name}
                       </Button>
                     ))}
                   </div>
                 </div>
               )}
               {services.length === 0 && (
                 <p className="text-[12px] text-ink-soft">
                   Add a service first so you can link this staff member to it.
                 </p>
               )}
     
               <div>
                 <span className="text-[12px] font-semibold text-ink">Working days</span>
                 <div className="mt-1.5 flex flex-wrap gap-2">
                   {WEEKDAYS.map((d) => (
                     <Button
                       type="button"
                       key={d.value}
                       onClick={() => toggleDay(d.value)}
                       className={`w-11 rounded-md border py-1.5 text-[12px] font-medium ${
                         days.includes(d.value)
                           ? "border-moss bg-moss text-white"
                           : "border-stone text-ink-soft"
                       }`}
                     >
                       {d.label}
                     </Button>
                   ))}
                 </div>
               </div>
     
               <div className="flex gap-3">
                 <label>
                   <span className="text-[12px] font-semibold text-ink">Start</span>
                   <input
                     type="time"
                     className="input"
                     value={startTime}
                     onChange={(e) => setStartTime(e.target.value)}
                   />
                 </label>
                 <label>
                   <span className="text-[12px] font-semibold text-ink">End</span>
                   <input
                     type="time"
                     className="input"
                     value={endTime}
                     onChange={(e) => setEndTime(e.target.value)}
                   />
                 </label>
               </div>
     
               <div className="flex gap-2">
                 <button
                   type="submit"
                   disabled={submitting}
                   className="rounded-md bg-moss px-4 py-2 text-[13px] font-semibold text-white hover:bg-moss-dark disabled:opacity-50"
                 >
                   {submitting
                     ? editingId
                       ? "Saving…"
                       : "Adding…"
                     : editingId
                     ? "Save changes"
                     : "Add staff member"}
                 </button>
                 {(resources.length > 0 || editingId) && (
                   <button
                     type="button"
                     onClick={closeForm}
                     className="rounded-md px-4 py-2 text-[13px] font-medium text-ink-soft hover:bg-stone-soft"
                   >
                     Cancel
                   </button>
                 )}
               </div>
             </form>
           )}
     
           {resources.length === 0 && !showForm ? (
             <EmptyState
               title="No staff yet"
               body="Add at least one staff member with working hours before clients can book a time slot."
             />
           ) : (
             (() => {
               const filtered = resources.filter((r) => {
                 const matchesFilter = staffFilter === "all" || (staffFilter === "active" && r.isActive !== false) || (staffFilter === "inactive" && r.isActive === false);
                 const q = searchQuery.trim().toLowerCase();
                 return matchesFilter && (!q || r.name.toLowerCase().includes(q) || Boolean(r.email?.toLowerCase().includes(q)));
               });

               if (!filtered.length) return (
                 <div className="rounded-lg border border-stone bg-paper-raised px-5 py-10 text-center">
                   <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-stone-soft"><Users size={18} className="text-ink-soft" /></div>
                   <h3 className="mt-3 text-sm font-semibold text-ink">No staff members found</h3>
                   <p className="mx-auto mt-1 max-w-sm text-[11px] leading-4 text-ink-soft">Try a different search or filter, or add a new staff member.</p>
                 </div>
               );

               return (
                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                   {filtered.map((r) => {
                     const hours = r.workingHours ?? [];
                     const dayLabels = WEEKDAYS.filter((d) => hours.some((h) => h.dayOfWeek === d.value)).map((d) => d.label);
                     const daySummary = dayLabels.length === 0 ? "No availability set" : dayLabels.length === 5 && dayLabels.every((d) => ["Monday","Tuesday","Wednesday","Thursday","Friday"].includes(d)) ? "Mon–Fri" : dayLabels.length === 7 ? "Every day" : dayLabels.map((d) => d.slice(0,3)).join(", ");
                     const timeSummary = hours.length ? `${hours[0].startTime}–${hours[0].endTime}` : "Schedule not set";
                     const serviceNames = (r.serviceIds ?? []).map((id) => services.find((s) => s.id === id)?.name).filter((name): name is string => Boolean(name));
                     const initials = r.name.trim().split(/\s+/).slice(0,2).map((part) => part[0]).join("").toUpperCase();
                     const active = r.isActive !== false;

                     return (
                       <Card key={r.id} className={`border-stone bg-paper-raised transition-shadow hover:shadow-sm ${!active ? "opacity-75" : ""}`}>
                         <CardHeader className="pb-3">
                           <div className="flex items-start justify-between gap-3">
                             <div className="flex min-w-0 items-center gap-3">
                               <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-soft text-xs font-semibold text-moss">{initials || <UserRound size={16} />}</div>
                               <div className="min-w-0">
                                 <CardTitle className="truncate text-sm font-semibold text-ink capitalize">{r.name}</CardTitle>
                                 <div className="mt-1 flex items-center gap-1.5">{active ? <><CheckCircle2 size={12} className="text-moss" /><span className="text-[10px] font-medium text-moss">Active</span></> : <><XCircle size={12} className="text-rust" /><span className="text-[10px] font-medium text-rust">Inactive</span></>}</div>
                               </div>
                             </div>
                             <div className="relative shrink-0">
                               <Button variant="ghost" size="sm" aria-label={`Actions for ${r.name}`} onClick={() => setOpenMenuId((id) => id === r.id ? null : r.id)} className="h-8 w-8 rounded-full p-0 text-ink-soft hover:bg-stone-soft"><MoreHorizontal size={17} /></Button>
                               {openMenuId === r.id && (
                                 <div className="absolute right-0 top-9 z-20 w-40 rounded-lg border border-stone bg-paper-raised p-1 shadow-lg">
                                   <button type="button" onClick={() => { setOpenMenuId(null); openEditForm(r); }} className="flex w-full rounded-md px-3 py-2 text-left text-[11px] font-medium text-ink hover:bg-stone-soft">Edit staff</button>
                                   <button type="button" onClick={() => { setOpenMenuId(null); openEditForm(r); }} className="flex w-full rounded-md px-3 py-2 text-left text-[11px] font-medium text-ink hover:bg-stone-soft">Manage availability</button>
                                   {active ? <button type="button" onClick={() => { setOpenMenuId(null); handleDeactivate(r); }} className="flex w-full rounded-md px-3 py-2 text-left text-[11px] font-medium text-rust hover:bg-rust/5">Deactivate</button> : <button type="button" onClick={() => { setOpenMenuId(null); toast.info("Reactivation needs to be connected to the resource API."); }} className="flex w-full rounded-md px-3 py-2 text-left text-[11px] font-medium text-moss hover:bg-stone-soft">Reactivate</button>}
                                 </div>
                               )}
                             </div>
                           </div>
                         </CardHeader>
                         <CardContent className="space-y-4">
                           <div>
                             <div className="mb-1.5 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-ink-soft"><Clock3 size={11} />Availability</div>
                             <p className="text-[12px] font-medium text-ink">{daySummary}</p>
                             <p className="mt-0.5 text-[11px] text-ink-soft">{timeSummary}</p>
                           </div>
                           <div>
                             <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-ink-soft">Services</div>
                             {serviceNames.length ? <div className="flex flex-wrap gap-1.5">{serviceNames.map((serviceName) => <span key={serviceName} className="rounded-full border border-stone px-2.5 py-1 text-[10px] text-ink-soft">{serviceName}</span>)}</div> : <p className="text-[11px] text-ink-soft">No services assigned</p>}
                           </div>
                           <div className="border-t border-stone-soft pt-3">
                             <div className="flex items-center justify-between gap-3"><span className="text-[10px] text-ink-soft">Booking access</span><span className="text-[10px] font-medium text-ink">{r.CanViewAllBookings ? "All bookings" : "Own bookings"}</span></div>
                           </div>
                         </CardContent>
                       </Card>
                     );
                   })}
                 </div>
               );
             })()
           )}
         </div>
  );
}
