import React from "react";

const NoteCard = ({ note }) => {
  const { title, content, tags = [] } = note;
  const preview = content?.length > 120 ? `${content.slice(0, 120)}...` : content;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-1">
        {title}
      </h3>
      <p className="mb-3 text-sm text-gray-600 line-clamp-3">{preview}</p>
      {tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoteCard;
