import { atom } from "jotai";

/**
 * Tracks whether the welcome subscription banner has been shown during the current app session.
 * This prevents it from re-appearing on navigation.
 */
export const hasShownWelcomeBannerAtom = atom(false); 