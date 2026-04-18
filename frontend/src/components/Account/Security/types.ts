export type SecuritySection = "email" | "password" | "session" | null;

export type SecurityContextState = {
  activeSection: SecuritySection;
  setActiveSection: React.Dispatch<React.SetStateAction<SecuritySection>>;
};
