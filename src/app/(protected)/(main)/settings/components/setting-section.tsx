interface SettingSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const SettingSection = ({
  title,
  description,
  children,
}: SettingSectionProps) => (
  <div className="space-y-4">
    <div className="space-y-1">
      <h3 className="text-base font-medium">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
    {children}
  </div>
);
