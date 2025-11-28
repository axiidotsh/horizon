interface PageHeadingProps {
  children: React.ReactNode;
}

export const PageHeading = ({ children }: PageHeadingProps) => {
  return (
    <h1 className="text-muted-foreground font-mono text-sm">{children}</h1>
  );
};
