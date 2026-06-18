import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "#fffdf9",
          "--normal-text": "#1f1710",
          "--normal-border": "#ded6c8",
          "--success-bg": "#f3f7ee",
          "--success-text": "#182514",
          "--success-border": "#c6d8b8",
          "--error-bg": "#fff3f0",
          "--error-text": "#591a15",
          "--error-border": "#efc0b7",
          "--warning-bg": "#fff8e8",
          "--warning-text": "#4f3008",
          "--warning-border": "#efd59c",
          "--info-bg": "#f4f2ec",
          "--info-text": "#241b12",
          "--info-border": "#d7cabb",
          "--border-radius": "14px",
        }
      }
      toastOptions={{
        classNames: {
          toast:
            "border shadow-[0_18px_45px_rgba(41,34,25,0.16)] backdrop-blur-md",
          title: "!text-[#1f1710] font-semibold tracking-tight",
          description: "!text-[#2d2116] text-[13px] opacity-100",
          icon: "text-primary",
          success: "[&_[data-icon]]:text-green-700",
          error: "[&_[data-icon]]:text-red-700",
          warning: "[&_[data-icon]]:text-amber-700",
          info: "[&_[data-icon]]:text-stone-700",
        },
      }}
      {...props} />
  );
}

export { Toaster }
