import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const Sheet = ({ children, ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) => (
  <DialogPrimitive.Root {...props}>{children}</DialogPrimitive.Root>
)
Sheet.displayName = DialogPrimitive.Root.displayName

const SheetTrigger = DialogPrimitive.Trigger
SheetTrigger.displayName = DialogPrimitive.Trigger.displayName

const SheetClose = DialogPrimitive.Close
SheetClose.displayName = DialogPrimitive.Close.displayName

const SheetPortal = DialogPrimitive.Portal
SheetPortal.displayName = DialogPrimitive.Portal.displayName

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
))
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & VariantProps<typeof sheetContentVariants>
>(({ className, side = "right", ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 gap-4 bg-background p-6 shadow-lg transition duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left-10 data-[state=closed]:slide-out-to-right-10 data-[state=closed]:slide-out-to-top-10 data-[state=closed]:slide-out-to-bottom-10 data-[state=open]:slide-in-from-left-10 data-[state=open]:slide-in-from-right-10 data-[state=open]:slide-in-from-top-10 data-[state=open]:slide-in-from-bottom-10",
        sheetContentVariants({ side }),
        className,
      )}
      {...props}
    />
  </SheetPortal>
))
SheetContent.displayName = DialogPrimitive.Content.displayName

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2.5 text-center sm:text-left", className)} {...props} />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-6 flex flex-col justify-end space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0", className)}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold text-foreground", className)} {...props} />
))
SheetTitle.displayName = DialogPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
SheetDescription.displayName = DialogPrimitive.Description.displayName

const sheetContentVariants = cva(
  "border-border/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-100 data-[state=closed]:slide-out-to-right-full data-[state=closed]:slide-out-to-left-full data-[state=closed]:slide-out-to-top-full data-[state=closed]:slide-out-to-bottom-full data-[state=open]:slide-in-from-right-full data-[state=open]:slide-in-from-left-full data-[state=open]:slide-in-from-top-full data-[state=open]:slide-in-from-bottom-full border",
  {
    variants: {
      side: {
        top: "border-b border-b-border data-[state=closed]:slide-out-to-top-full data-[state=open]:slide-in-from-top-full",
        bottom:
          "border-t border-t-border data-[state=closed]:slide-out-to-bottom-full data-[state=open]:slide-in-from-bottom-full",
        left: "border-r border-r-border data-[state=closed]:slide-out-to-left-full data-[state=open]:slide-in-from-left-full",
        right:
          "border-l border-l-border data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
)

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetOverlay,
}
