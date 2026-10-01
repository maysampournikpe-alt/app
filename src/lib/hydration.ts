"use client";

import { createContext, useContext } from "react";

/** true once the student's saved data has been loaded from the device. */
export const HydratedContext = createContext(false);
export const useHydrated = () => useContext(HydratedContext);
