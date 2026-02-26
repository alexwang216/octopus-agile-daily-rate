import { useRegisterSW } from "virtual:pwa-register/react";

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("SW registered:", r);
    },
    onRegisterError(error) {
      console.log("SW registration error:", error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-slate-700 p-4 shadow-lg">
      <div className="mb-2 text-sm text-slate-200">
        {offlineReady ? (
          <span>App ready to work offline.</span>
        ) : (
          <span>New content available. Click reload to update.</span>
        )}
      </div>
      <div className="flex gap-2">
        {needRefresh && (
          <button
            className="rounded bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-700"
            onClick={() => updateServiceWorker(true)}
          >
            Reload
          </button>
        )}
        <button
          className="rounded bg-slate-600 px-3 py-1 text-sm text-white hover:bg-slate-500"
          onClick={close}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default ReloadPrompt;
