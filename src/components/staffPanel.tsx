"use client";

import { useState } from "react";
import { toast } from "sonner";
import EmptyState from "./emptyState";
import type { Resource, Service } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

const WEEKDAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

const DEFAULT_DAYS = [1, 2, 3, 4, 5];
const DEFAULT_START = '09:00';
const DEFAULT_END = '17:00';

type WorkingHourEntry = { dayOfWeek: number; startTime: string; endTime: string;};

type ResourceWithDetails = Resource & {
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

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [submitting, setSubmitting] = useState(false);

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
    setSelectedServiceIds([]);
    setDays(DEFAULT_DAYS);
    setStartTime(DEFAULT_START);
    setEndTime(DEFAULT_END);
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
         <div className="mb-6 flex items-start justify-between">
           <div>
             <h2 className="font-display text-2xl font-semibold text-ink">Staff</h2>
             <p className="mt-1 text-[13px] text-ink-soft">
               Who clients can book, and when they are available.
             </p>
           </div>
           {!showForm && (
             <button
               onClick={openAddForm}
               className="rounded-md border border-stone px-3.5 py-2 text-[13px] font-medium text-ink hover:bg-stone-soft"
             >
               + Add staff
             </button>
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
   
             {services.length > 0 && (
               <div>
                 <span className="text-[12px] font-semibold text-ink">Can perform</span>
                 <div className="mt-1.5 flex flex-wrap gap-2">
                   {services.map((s) => (
                     <button
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
                     </button>
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
                   <button
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
                   </button>
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
           <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
             {resources.map((r) => {
               const hours = r.workingHours ?? [];
               const dayLabels = WEEKDAYS.filter((d) =>
                 hours.some((h) => h.dayOfWeek === d.value)
               )
                 .map((d) => d.label)
                 .join(", ");
               const serviceNames = (r.serviceIds ?? [])
                 .map((id) => services.find((s) => s.id === id)?.name)
                 .filter((name): name is string => Boolean(name));
   
               return (
                 <Card key={r.id} className="border-stone bg-paper-raised">
                   <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                     <CardTitle className="font-semibold text-ink">{r.name}</CardTitle>
                     <div className="flex shrink-0 gap-1">
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => openEditForm(r)}
                         disabled={loadingEditingId === r.id}
                         className="h-auto px-2 py-1 text-[12px] font-medium text-ink-soft hover:bg-stone-soft"
                       >
                         {loadingEditingId === r.id ? "Loading…" : "Edit"}
                       </Button>
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => handleDeactivate(r)}
                         className="h-auto px-2 py-1 text-[12px] font-medium text-rust hover:bg-stone-soft"
                       >
                         Remove
                       </Button>
                     </div>
                   </CardHeader>
                   <CardContent>
                     {hours.length > 0 && (
                       <p className="text-[12px] text-ink-soft">
                         {dayLabels || "No days set"} · {hours[0].startTime}–{hours[0].endTime}
                       </p>
                     )}
                     {serviceNames.length > 0 ? (
                       <div className="mt-1.5 flex flex-wrap gap-1.5">
                         {serviceNames.map((name) => (
                           <span
                             key={name}
                             className="rounded-full border border-stone px-2.5 py-0.5 text-[11px] text-ink-soft"
                           >
                             {name}
                           </span>
                         ))}
                       </div>
                     ) : (
                       <p className="mt-1.5 text-[12px] text-ink-soft">No services assigned yet</p>
                     )}
                   </CardContent>
                 </Card>
               );
             })}
           </div>
         )}
       </div>
  );
}
