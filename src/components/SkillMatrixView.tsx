import React, { useState } from 'react';
import { ResumeAnalysisResult } from '../types/resume';
import { Search, Layers, CheckCircle } from 'lucide-react';

interface SkillMatrixViewProps {
  result: ResumeAnalysisResult;
}

export const SkillMatrixView: React.FC<SkillMatrixViewProps> = ({ result }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['all', ...Object.keys(result.skills.byCategory)];

  const filteredSkills = result.skills.hardSkills.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Technical Skill Inventory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Indexed {result.skills.hardSkills.length} technical skills across your experience and education sections
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verified skills..."
            className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {cat === 'all' ? 'All Skills' : cat}
          </button>
        ))}
      </div>

      {/* Skills Table & Grid */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50/75 px-5 py-3 text-xs font-semibold text-slate-700">
          <div className="col-span-4 sm:col-span-5">Skill Name</div>
          <div className="col-span-4 sm:col-span-3">Category</div>
          <div className="col-span-2 text-center">Mentions</div>
          <div className="col-span-2 text-right">Demonstration Level</div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredSkills.length > 0 ? (
            filteredSkills.map((skill) => (
              <div
                key={skill.name}
                className="grid grid-cols-12 items-center px-5 py-3 text-xs hover:bg-slate-50/60 transition-colors"
              >
                <div className="col-span-4 sm:col-span-5 font-medium text-slate-900 flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{skill.name}</span>
                </div>
                <div className="col-span-4 sm:col-span-3 text-slate-500 truncate">
                  {skill.category}
                </div>
                <div className="col-span-2 text-center font-mono font-medium text-slate-700 tabular-nums">
                  {skill.mentions}x
                </div>
                <div className="col-span-2 text-right font-medium">
                  {skill.level === 'strong' ? (
                    <span className="text-emerald-700">Strong</span>
                  ) : skill.level === 'intermediate' ? (
                    <span className="text-blue-700">Intermediate</span>
                  ) : (
                    <span className="text-slate-600">Emerging</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              No skills match your search query.
            </div>
          )}
        </div>
      </div>

      {/* Categorized Architecture Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(result.skills.byCategory).map(([category, items]) => (
          <div
            key={category}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
          >
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-4 w-4 text-slate-600" />
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                {category}
              </h3>
            </div>

            <div className="flex flex-wrap gap-x-2 gap-y-1.5 text-xs text-slate-700">
              {items.map((it, idx) => (
                <span key={it} className="inline-flex items-center">
                  <span className="font-medium text-slate-800">{it}</span>
                  {idx < items.length - 1 && (
                    <span className="ml-2 text-slate-300" aria-hidden="true">
                      ·
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}

        {/* Soft Skills & Leadership competencies */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="h-4 w-4 text-slate-600" />
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Leadership & Methodologies
            </h3>
          </div>

          <div className="flex flex-wrap gap-x-2 gap-y-1.5 text-xs text-slate-700">
            {result.skills.softSkills.map((ss, idx) => (
              <span key={ss} className="inline-flex items-center">
                <span className="font-medium text-slate-800">{ss}</span>
                {idx < result.skills.softSkills.length - 1 && (
                  <span className="ml-2 text-slate-300" aria-hidden="true">
                    ·
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
