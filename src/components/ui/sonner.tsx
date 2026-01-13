import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import "./styles/components.css";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="sonner-toaster"
      toastOptions={{
        classNames: {
          toast: "sonner-toast",
          description: "sonner-description",
          actionButton: "sonner-action-button",
          cancelButton: "sonner-cancel-button",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
