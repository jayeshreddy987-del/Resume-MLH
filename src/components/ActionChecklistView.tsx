import React, { useState } from 'react';
import { ActionChecklistItem } from '../types/resume';
import { CheckSquare, Square, Plus, CheckCircle, Target } from 'lucide-react';

interface ActionChecklistViewProps {
  actionPlan: ActionChecklistItem[];
  targetRole: string;
}

export const ActionChecklistView: React.FC<ActionChecklistViewProps> = ({
  actionPlan: initialActionPlan,
  targetRole,
}) => {
  const [items, setItems] = useState<ActionChecklistItem[]>(initialActionPlan);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = items.filter((i) => i.completed).length;
  const progressPercent = Math.round((completedCount / (items.length || 1)) * 100);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: ActionChecklistItem = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || 'Custom user improvement item.',
      category: 'Impact',
      priority: 'high',
      completed: false,
    };

    setItems([newItem, ...items]);
    setNewTitle('');
    setNewDesc('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Progress Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <Target className="h-3.5 w-3.5 text-slate-400" />
              <span>Target Role: {targetRole}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Resume Improvement Roadmap
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Step-by-step prioritized tasks to bring your resume from current state to interview-ready benchmark.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-xs text-slate-500">Tasks Completed</div>
              <div className="font-mono text-xl font-bold tabular-nums text-slate-900">
                {completedCount} / {items.length}
              </div>
            </div>
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-900 text-white font-mono text-xs font-bold">
              {progressPercent}%
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-slate-900 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Checklist Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Prioritized Action Items ({items.length})
        </h3>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{showAddForm ? 'Cancel' : 'Add Custom Task'}</span>
        </button>
      </div>

      {/* Add Custom Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddItem}
          className="rounded-xl border border-slate-300 bg-slate-50/70 p-4 space-y-3"
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Task title (e.g., Rewrite CloudScale experience bullets with XYZ formula)..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          <textarea
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Details or notes on how to accomplish this task..."
            rows={2}
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors shadow-2xs"
            >
              Save Task
            </button>
          </div>
        </form>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        {items.map((item) => {
          const isDone = item.completed;
          return (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`flex items-start gap-3.5 rounded-xl border p-4.5 cursor-pointer transition-all ${
                isDone
                  ? 'border-slate-200 bg-slate-50/50 opacity-60'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
              }`}
            >
              <button
                type="button"
                className="mt-0.5 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
              >
                {isDone ? (
                  <CheckSquare className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Square className="h-5 w-5" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <h4
                    className={`text-xs font-semibold text-slate-900 ${
                      isDone ? 'line-through text-slate-500' : ''
                    }`}
                  >
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 shrink-0">
                    <span>{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`capitalize font-medium ${
                        item.priority === 'urgent'
                          ? 'text-rose-600'
                          : item.priority === 'high'
                          ? 'text-amber-600'
                          : 'text-slate-600'
                      }`}
                    >
                      {item.priority} Priority
                    </span>
                  </div>
                </div>

                <p
                  className={`text-xs text-slate-600 leading-relaxed ${
                    isDone ? 'line-through text-slate-400' : ''
                  }`}
                >
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {completedCount === items.length && items.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-6 text-center text-xs text-emerald-800">
          <CheckCircle className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
          <div className="font-semibold text-sm">All Action Items Completed!</div>
          <p className="mt-1 text-emerald-700">
            You have executed all recommended improvements. Re-run an analysis to verify your updated ATS score!
          </p>
        </div>
      )}
    </div>
  );
};
