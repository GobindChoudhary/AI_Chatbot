import React from "react";

export default function NameModal({ open, onClose, onSubmit, initial = "" }) {
  const [value, setValue] = React.useState(initial);

  React.useEffect(() => {
    setValue(initial || "");
  }, [initial, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={() => onClose()} />

      <div className="relative bg-white dark:bg-[#061021] rounded-lg w-full max-w-md mx-4 p-6 z-10 shadow-lg">
        <h3 className="text-lg font-semibold text-[var(--text)]">
          Name your chat
        </h3>
        <p className="text-sm text-[var(--muted)] mt-1">
          Give this chat a descriptive name.
        </p>

        <div className="mt-4">
          <input
            className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-[#021022] border border-gray-200 dark:border-[#102233] focus:outline-none"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. Travel plans"
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            className="px-3 py-2 rounded bg-gray-200 dark:bg-[#071722]"
            onClick={() => onClose()}
          >
            Cancel
          </button>
          <button
            className="px-3 py-2 rounded bg-[var(--accent)] text-black"
            onClick={() => onSubmit(value.trim())}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
