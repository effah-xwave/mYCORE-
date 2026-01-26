import React, { useState } from "react";
import { useApp } from "../App";
import { Task, Priority, ReminderType } from "../types";
import { formatDate } from "../utils";
import {
  X,
  Bell,
  ListChecks,
  Paperclip,
  Plus,
  Trash2,
  Link,
} from "lucide-react";

export default function AddTaskModal({ onClose }: { onClose: () => void }) {
  const { addTask, projects } = useApp();
  const [formData, setFormData] = useState<Partial<Task>>({
    title: "",
    description: "",
    dueDate: formatDate(new Date()),
    priority: Priority.MEDIUM,
    category: "General",
    reminder: { type: ReminderType.AT_DEADLINE },
  });

  // Subtasks State
  const [subtasks, setSubtasks] = useState<
    { id: string; title: string; completed: boolean }[]
  >([]);
  const [newSubtask, setNewSubtask] = useState("");

  // Attachments State
  const [attachment, setAttachment] = useState("");

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: Date.now().toString() + Math.random(),
        title: newSubtask,
        completed: false,
      },
    ]);
    setNewSubtask("");
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    await addTask({
      id: `task_${Date.now()}`,
      title: formData.title,
      description: formData.description || "",
      dueDate: formData.dueDate!,
      priority: formData.priority as Priority,
      category: formData.category || "General",
      projectId: formData.projectId,
      completed: false,
      reminder: formData.reminder,
      subtasks: subtasks,
      attachments: attachment ? [attachment] : [],
    } as Task);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-dark-card rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl overflow-y-auto max-h-[90vh] border border-slate-100 dark:border-dark-border/50">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            New Task
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-dark-cardHover transition-all"
          >
            <X className="text-slate-400" size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full text-2xl font-black placeholder:text-slate-200 border-none focus:ring-0 p-0 text-slate-900 dark:text-white bg-transparent tracking-tight"
            placeholder="Name your task..."
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            autoFocus
          />
          <textarea
            className="w-full text-base text-slate-500 dark:text-slate-400 placeholder:text-slate-200 border-none focus:ring-0 p-0 resize-none h-24 bg-transparent font-medium"
            placeholder="Add some details..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">
                Due Date
              </label>
              <input
                type="date"
                className="w-full mt-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border text-sm font-bold text-slate-700 dark:text-white focus:border-indigo-500 focus:outline-none transition-all"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">
                Priority
              </label>
              <select
                className="w-full mt-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border text-sm font-bold text-slate-700 dark:text-white focus:border-indigo-500 focus:outline-none transition-all appearance-none"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as Priority,
                  })
                }
              >
                {Object.values(Priority).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">
                Project (Optional)
              </label>
              <select
                className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-navy-900 focus:outline-none transition-colors"
                value={formData.projectId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    projectId: e.target.value || undefined,
                  })
                }
              >
                <option value="">None</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">
                Category
              </label>
              <input
                className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-navy-900 focus:outline-none transition-colors"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="e.g. Work"
              />
            </div>
          </div>

          {/* SUBTASKS SECTION */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <ListChecks size={14} className="text-navy-900" />
              <label className="text-xs font-bold text-slate-400 uppercase">
                Subtasks
              </label>
            </div>

            <div className="space-y-2 mb-3">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between bg-white p-2 rounded-lg text-sm border border-slate-100 shadow-sm animate-fade-in"
                >
                  <span className="truncate flex-1 mr-2 text-slate-700">
                    {st.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSubtask(st.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                className="flex-1 p-2 rounded-lg bg-white border border-slate-200 text-sm focus:border-navy-900 focus:outline-none placeholder:text-slate-300 transition-all"
                placeholder="Add a subtask..."
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addSubtask())
                }
              />
              <button
                type="button"
                onClick={addSubtask}
                className="p-2 bg-white border border-slate-200 rounded-lg hover:border-navy-900 hover:text-navy-900 text-slate-400 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* ATTACHMENTS SECTION */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Paperclip size={14} className="text-navy-900" />
              <label className="text-xs font-bold text-slate-400 uppercase">
                Attachment (URL)
              </label>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-3 py-2 focus-within:border-navy-900 transition-colors">
              <Link size={14} className="text-slate-300" />
              <input
                className="w-full text-sm focus:outline-none placeholder:text-slate-300 text-navy-900"
                placeholder="e.g., https://drive.google.com/file..."
                value={attachment}
                onChange={(e) => setAttachment(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Bell size={14} className="text-navy-900" />
              <label className="text-xs font-bold text-slate-400 uppercase">
                Smart Reminder
              </label>
            </div>
            <select
              className="w-full p-2 rounded-lg bg-white border border-slate-200 text-sm focus:border-navy-900 focus:outline-none transition-colors"
              value={formData.reminder?.type}
              onChange={(e) => {
                const newType = e.target.value as ReminderType;
                setFormData({
                  ...formData,
                  reminder: {
                    type: newType,
                    customDate:
                      newType === ReminderType.CUSTOM
                        ? formData.reminder?.customDate
                        : undefined,
                  },
                });
              }}
            >
              {Object.values(ReminderType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {formData.reminder?.type === ReminderType.CUSTOM && (
              <div className="mt-3 animate-fade-in">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
                  Custom Time
                </label>
                <input
                  type="datetime-local"
                  className="w-full p-2 rounded-lg bg-white border border-slate-200 text-sm focus:border-navy-900 focus:outline-none transition-colors"
                  value={formData.reminder?.customDate || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reminder: {
                        ...formData.reminder!,
                        customDate: e.target.value,
                      },
                    })
                  }
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 dark:shadow-indigo-900/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
          >
            Create Mission
          </button>
        </form>
      </div>
    </div>
  );
}
