import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type AuthMode = "login" | "register";

export function AuthModal({
  open,
  mode,
  onOpenChange,
  onModeChange,
}: {
  open: boolean;
  mode: AuthMode;
  onOpenChange: (open: boolean) => void;
  onModeChange: (mode: AuthMode) => void;
}) {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Your PurchaseWise account</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Accounts let you save decisions and price watchlists. This demo build stores nothing.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => onModeChange(v as AuthMode)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Log in</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setNotice("Demo mode: sign-in is not connected to a live account service yet.");
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  required
                  placeholder="Your password"
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full">
                Log in
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="mt-4">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setNotice(
                  "Demo mode: registration is not connected to a live account service yet.",
                );
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="reg-name">Full name</Label>
                <Input id="reg-name" required placeholder="Your name" autoComplete="name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Create password</Label>
                <Input
                  id="reg-password"
                  type="password"
                  required
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full">
                Create account
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {notice ? (
          <p
            role="status"
            className="rounded-md border border-border bg-warning-soft px-3 py-2 text-sm font-medium text-warning-soft-foreground"
          >
            {notice}
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
