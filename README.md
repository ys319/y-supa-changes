# y-supa-changes

Supabase postgres changes provider for yjs.

## Install

write jsr registry to `.npmrc`.

```
@jsr:registry=https://npm.jsr.io
```

## Exports

- Core
  - createSupaChangesAdapter
- React helper (with `y-valtio`)
  - SupaChangesContextProvider
  - useSupaChanges

## Usage

### Core

```typescript
import { createSupaChangesAdapter } from "@ys319/y-supa-changes"

// Create adapter.
// Resolve promise on metadata loaded.
const provider = await createSupaChangesAdapter(
    supabaseClient,
    room_id,
    yjs_doc,
);

// Start sync.
// Resolve promise on server connected and first state synced.
await provider.initialize();
```

### React

Use `SupabaseChangesContextProvider`. (Too long name. lol)

```tsx
import { SupaChangesContextProvider } from "@ys319/y-supa-changes/react"

// ...

<SupaChangesContextProvider<Store>
    supabase={supabase}
    room={workspace}
    storeInitFn={storeInit}
    Loading={<Loading />}
>
    <App />
</SupaChangesContextProvider>;
```

And use hooks.

```typescript
import { useSupaChanges } from "@ys319/y-supa-changes/react"

// ...

const { store } = useSupaChanges<Store>()
```
