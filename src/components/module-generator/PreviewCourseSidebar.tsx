
import React from 'react';
import { ExtendedCourse } from '@/types/extended-course';

interface PreviewCourseSidebarProps {
  course: ExtendedCourse;
  activeUnit: number;
  activeSubunit: number;
  activeModuleId: string | null;
  onNavigate: (unitIdx: number, subunitIdx: number, moduleIdx: number, unitId: string, subunitId: string, moduleId: string) => void;
}

const PreviewCourseSidebar: React.FC<PreviewCourseSidebarProps> = ({
  course,
  activeUnit,
  activeSubunit,
  activeModuleId,
  onNavigate
}) => {
  return (
    <aside className="w-72 min-h-[30rem] bg-dark-400/60 rounded-xl border border-dark-300/50 p-3 flex flex-col shadow-lg mr-4">
      <h2 className="font-bold text-lg text-white mb-2">{course.title}</h2>
      <nav className="flex-1 overflow-y-auto pr-1">
        {course.modules.map((unit, unitIdx) => (
          <div key={unit.id || unitIdx} className="mb-2">
            <button
              className={`w-full text-left px-2 py-1 rounded font-semibold mb-1 ${
                activeUnit === unitIdx ? 'bg-kibi-500 text-white' : 'text-gray-300 hover:bg-dark-300'
              }`}
              onClick={() => {
                // jump to first subunit/module of this unit
                const sub = unit.content?.[0];
                const mod = sub?.modules?.[0];
                if (sub && mod)
                  onNavigate(unitIdx, 0, 0, unit.id, sub.id, mod.id);
              }}
            >
              {unitIdx + 1}. {unit.title}
            </button>
            {unit.content && unit.content.map((subunit, subunitIdx) => (
              <div key={subunit.id || subunitIdx} className="ml-3">
                <div className="font-medium text-xs text-gray-400 mb-1">{subunit.title}</div>
                {subunit.modules && subunit.modules.map((mod, modIdx) => (
                  <button
                    key={mod.id || modIdx}
                    className={`block w-full text-left px-3 py-1 rounded text-sm ${
                      activeUnit === unitIdx && activeSubunit === subunitIdx && activeModuleId === mod.id
                        ? 'bg-kibi-500/80 text-white'
                        : 'text-gray-400 hover:bg-dark-300'
                    }`}
                    onClick={() => onNavigate(unitIdx, subunitIdx, modIdx, unit.id, subunit.id, mod.id)}
                  >
                    {mod.title}
                  </button>
                ))}
              </div>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default PreviewCourseSidebar;
