import { useEffect, useState } from "react";
import { editUser, getCurrentAccount } from "../api/users";

// Lets already-mounted components react to a change made in the same tab,
// so toggling in Settings updates any open listing without a reload.
const CHANGE_EVENT = "blockContentWarnings-changed";

// Cached so the listing pages don't each refetch the account on mount.
let cachedValue: boolean | null = null;

/**
 * Persists the "hide projects with content warnings" preference to the API and
 * notifies any mounted listeners.
 */
export const writeBlockContentWarnings = async (
  value: boolean
): Promise<void> => {
  cachedValue = value;
  window.dispatchEvent(new Event(CHANGE_EVENT));

  const response = await editUser({ blockContentWarnings: value });

  if (response.error) {
    // Re-sync from the server so the UI doesn't show a value that didn't save.
    cachedValue = null;
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
};

/**
 * Subscribes to the logged-in user's "hide projects with content warnings"
 * setting. Defaults to false (nothing hidden) while loading or when signed out.
 */
export const useBlockContentWarnings = (): boolean => {
  const [blockContentWarnings, setBlockContentWarnings] = useState(
    cachedValue ?? false
  );

  useEffect(() => {
    let active = true;

    const sync = async () => {
      if (cachedValue === null) {
        const account = await getCurrentAccount();
        cachedValue = account.data?.blockContentWarnings ?? false;
      }
      if (active) setBlockContentWarnings(cachedValue);
    };
    sync();

    window.addEventListener(CHANGE_EVENT, sync);

    return () => {
      active = false;
      window.removeEventListener(CHANGE_EVENT, sync);
    };
  }, []);

  return blockContentWarnings;
};
