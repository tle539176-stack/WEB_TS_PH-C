export function EditorTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: Array<{ id: T; label: string }>;
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-neutral-100 bg-white px-5 pt-4">
      {tabs.map(tab => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
            active === tab.id
              ? 'border-[#0A3151] text-[#0A3151]'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
