import { QueryObserver, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { queryClient } from "./main";
import { timeQuery } from "./query";

export function QOTest() {
  const [show, setShow] = useState(true);
  const queryClient = useQueryClient();

  return (
    <div>
      <h1>
        hiding in one window breaks invalidation to the other window, even after
        showing again
      </h1>
      <button onClick={() => setShow((s) => !s)}>
        {show ? "hide" : "show"}
      </button>
      {show && <QOTestInner />}
      <button onClick={() => queryClient.invalidateQueries(timeQuery)}>
        invalidate
      </button>
    </div>
  );
}

function useQueryObserver() {
  const [qo] = useState(() => new QueryObserver(queryClient, timeQuery));

  const [time, setTime] = useState<string | undefined>(
    () => queryClient.getQueryData(timeQuery.queryKey)?.time
  );

  const cleanupSubscriptionRef = useRef<() => void>();

  useEffect(() => {
    cleanupSubscriptionRef.current = qo.subscribe((res) => {
      setTime(res.data?.time);
    });

    return () => {
      cleanupSubscriptionRef.current?.();
    };
  }, [qo]);

  return { time, qo };
}

function QOTestInner() {
  const { time, qo } = useQueryObserver();

  return (
    <div>
      <pre>{JSON.stringify(time)}</pre>
      <pre>Has listeners: {JSON.stringify(qo.hasListeners())}</pre>
    </div>
  );
}
