export default function FileLink({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-sm p-sm bg-gray-100 dark:bg-cobalt-700 rounded shadow-sm">
      <svg
        className="w-lg h-lg text-cobalt-600 dark:text-amber-200"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-cobalt-800 dark:text-amber-100 underline hover:text-cobalt-900 dark:hover:text-amber-300"
      >
        {url.split("/").pop()}
      </a>
    </div>
  );
}
