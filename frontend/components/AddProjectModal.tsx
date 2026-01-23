import React, { useState } from "react";
import { useApp } from "../App";
import { Project } from "../types";
import { formatDate } from "../utils";
import { X } from "lucide-react";

export default function AddProjectModal({ onClose }: { onClose: () => void }) {
  const { addProject } = useApp();
  const [formData, setFormData] = useState<Partial<Project>>({
    name: "",
    description: "",
    startDate: formatDate(new Date()),
    endDate: formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // +1 week
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    await addProject({
      id: `proj_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      startDate: formData.startDate!,
      endDate: formData.endDate!,
      progress: 0,
      status: "active",
    } as Project);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-dark-card rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border border-slate-100 dark:border-dark-border/50">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            New Project
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-dark-cardHover transition-all"
          >
            <X className="text-slate-400" size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            className="w-full text-2xl font-black placeholder:text-slate-200 border-none focus:ring-0 p-0 text-slate-900 dark:text-white bg-transparent tracking-tight"
            placeholder="Project Title..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            autoFocus
          />
          <textarea
            className="w-full text-base text-slate-500 dark:text-slate-400 placeholder:text-slate-200 border-none focus:ring-0 p-0 resize-none h-24 bg-transparent font-medium"
            placeholder="What is the objective?"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">
                Start Date
              </label>
              <input
                type="date"
                className="w-full mt-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border text-sm font-bold text-slate-700 dark:text-white focus:border-indigo-500 focus:outline-none transition-all"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">
                End Date
              </label>
              <input
                type="date"
                className="w-full mt-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border text-sm font-bold text-slate-700 dark:text-white focus:border-indigo-500 focus:outline-none transition-all"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 dark:shadow-indigo-900/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Launch Project
          </button>
        </form>
      </div>
    </div>
  );
}
