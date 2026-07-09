'use client';

import { SignOutButton } from '@clerk/nextjs';

// Must match THEME_MODE_COOKIE in '@/libs/ThemeMode' (that file has server-only
// imports and can't be imported from a client component).
const THEME_MODE_COOKIE = 'theme_mode';

const clearThemeModeCookie = () => {
  // Best-effort: browsers without the Cookie Store API keep the stale cookie
  // until it's overwritten by the next `updateThemeMode` call.
  if ('cookieStore' in window) {
    void window.cookieStore.delete(THEME_MODE_COOKIE);
  }
};

export const SignOutThemeResetButton = (props: { label: string }) => (
  <SignOutButton>
    <button
      className="border-none text-gray-700 hover:text-gray-900"
      onClick={clearThemeModeCookie}
      type="button"
    >
      {props.label}
    </button>
  </SignOutButton>
);
