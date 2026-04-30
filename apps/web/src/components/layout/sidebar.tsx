import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const items = [
  { href: "/", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

export function Sidebar() {
  return (
    <nav className="h-full rounded-lg border bg-background p-3">
      <div className="px-2 py-2 text-sm font-medium text-muted-foreground">
        Navigation
      </div>
      <Separator className="my-2" />

      <ul className="grid gap-1">
        {items.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              className="block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
