"use client";

import { EnrichedUserDto } from "@/api/generated.schemas";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type CurrentUserContextValue = {
  currentUser: EnrichedUserDto | null | undefined;
  setCurrentUser: Dispatch<SetStateAction<EnrichedUserDto | null | undefined>>;
};

const CurrentUserContext = createContext<CurrentUserContextValue | undefined>(
  undefined,
);

export function CurrentUserProvider({
  value,
  children,
}: {
  value: EnrichedUserDto | null | undefined;
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<
    EnrichedUserDto | null | undefined
  >(value);

  useEffect(() => {
    setCurrentUser(value);
  }, [value]);

  const contextValue = useMemo(
    () => ({ currentUser, setCurrentUser }),
    [currentUser],
  );

  return (
    <CurrentUserContext.Provider value={contextValue}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  return useContext(CurrentUserContext)?.currentUser;
}

export function useSetCurrentUser() {
  const context = useContext(CurrentUserContext);

  if (!context) {
    throw new Error(
      "useSetCurrentUser must be used within CurrentUserProvider",
    );
  }

  return context.setCurrentUser;
}
