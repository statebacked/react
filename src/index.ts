import {
  StateBackedClient,
  StateValue,
  Event,
  Actor,
  errors,
  Subscription,
} from "@statebacked/client";
import { useEffect, useState } from "react";

export const useStateBackedMachine = <
  TEvent extends Exclude<Event, string>,
  TState extends StateValue,
  TContext extends Record<string, unknown> & {
    public?: Record<string, unknown>;
  },
>(
  client: StateBackedClient,
  {
    machineName,
    instanceName,
    machineVersionId,
    getInitialContext,
    onEventSendingError,
  }: {
    machineName: string;
    instanceName: string;
    machineVersionId?: string;
    getInitialContext: () => Partial<TContext>;
    onEventSendingError?: (event: TEvent, error: Error) => void;
  },
) => {
  const [actor, setActor] = useState<Actor<
    TEvent,
    TState,
    TContext["public"] extends Record<string, unknown>
      ? TContext["public"]
      : Record<string, unknown>
  > | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [inFlightEvents, setInFlightEvents] = useState(
    new Set<Parameters<NonNullable<typeof actor>["send"]>[0]>(),
  );

  useEffect(() => {
    setActor(null);
    let sub: Subscription | null = null;

    client.machineInstances
      .getOrCreateActor<TEvent, TState, TContext>(
        machineName,
        instanceName,
        () => ({
          context: getInitialContext(),
          machineVersionId,
        }),
      )
      .then((actor) => {
        sub = actor.subscribe(
          () => {
            setInFlightEvents(new Set(actor.inFlightEvents));
            setError(null);
          },
          (error) => {
            if (error instanceof errors.ActorEventSendingError) {
              onEventSendingError?.(error.event, error);
            }
            setError(error);
          },
        );
        const origSend = actor.send;
        actor.send = function (event) {
          origSend.call(this, event);
          setInFlightEvents(new Set(actor.inFlightEvents));
        };
        setActor(actor);
      })
      .catch(setError);

    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, [client, machineName, instanceName, machineVersionId]);

  return {
    actor,
    isLoading: actor === null,
    error,
    inFlightEvents,
    areEventsInFlight: inFlightEvents.size > 0,
  };
};
