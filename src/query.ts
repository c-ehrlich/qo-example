import {
  AsyncStorage,
  PersistedQuery,
  experimental_createPersister,
} from "@tanstack/query-persist-client-core";
import { queryOptions } from "@tanstack/react-query";
import { get, set, del, createStore, type UseStore } from "idb-keyval";

function newIdbStorage(idbStore: UseStore): AsyncStorage<PersistedQuery> {
  return {
    getItem: async (key) => await get(key, idbStore),
    setItem: async (key, value) => await set(key, value, idbStore),
    removeItem: async (key) => await del(key, idbStore),
  };
}

export const timeQuery = queryOptions({
  queryKey: ["time"],
  queryFn: async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return { time: new Date().toISOString() };
  },
  staleTime: 5000,
  gcTime: 1000 * 60 * 60 * 24 * 30, // 30 days,
  persister: experimental_createPersister<PersistedQuery>({
    storage: newIdbStorage(createStore("sample_db_name", "sample_store_name")),
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days,
    serialize: (persistedQuery) => persistedQuery,
    deserialize: (cached) => cached,
  }),
});
