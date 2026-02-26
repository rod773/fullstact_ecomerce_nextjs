# Preventing Hydration Errors in Next.js with `useEffect` + `mounted` Pattern

When working with frameworks like **Next.js** that support server-side rendering (SSR), you may run into **hydration errors** caused by discrepancies between what is rendered on the server and what React expects to see on the client.

This document explains a common workaround using the `useEffect` hook and a `mounted` state to ensure browser-only code does not run on the server.

---

## 🧠 Problem Background: Hydration Errors and `window` Undefined

In SSR, the initial HTML is rendered on the **server** and sent to the browser, where React **hydrates** it to make it interactive. However:

- The **server does not have access to browser APIs** like `window`, `document`, `localStorage`, etc.
- Trying to use them on the server causes errors, or worse, mismatches between server and client HTML—leading to a **hydration error**.

For example:

```tsx
// ❌ Causes error during SSR
const isMobile = window.innerWidth < 768;
```

## Why This Solution Works

```JavaScript
import { useEffect, useState } from "react";

const Component = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div>
      {/* Browser-only logic is now safe to use */}
    </div>
  );
};

```

- Custom Hook Version

```js
// hooks/use-is-mounted.ts
import { useEffect, useState } from "react";

export function useIsMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
```
