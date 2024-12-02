# y-supa-changes

Supabase postgres changes provider for yjs.

## Exports

- Core
  - createSupaChangesAdapter
- React helper (with `y-valtio`)
  - SupaChangesContextProvider
  - useSupaChanges

## Usage

### Core

```typescript
// Create adapter.
// Resolve promise on metadata received.
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
const { store } = useSupaChanges<Store>()
```
