import { useEffect, useState } from "react";
import { getCurrentAccount } from "../api/users";

/**
 * Reads the logged-in user's "block content warnings" account setting.
 *
 * Defaults to false (nothing hidden) while the account is still loading, when
 * the user is signed out, or when the backend does not yet return the field.
 */
export const useBlockContentWarnings = (): boolean => {
  const [blockContentWarnings, setBlockContentWarnings] = useState(false);

  useEffect(() => {
    let active = true;

    const loadSetting = async () => {
      const account = await getCurrentAccount();
      // Guard against setting state after the component unmounted.
      if (active) {
        setBlockContentWarnings(account.data?.blockContentWarnings ?? false);
      }
    };
    loadSetting();

    return () => {
      active = false;
    };
  }, []);

  return blockContentWarnings;
};
