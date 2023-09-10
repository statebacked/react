# React hooks to interact with StateBacked.dev machine instances

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/statebacked/react/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/@statebacked/client.svg?style=flat)](https://www.npmjs.com/package/@statebacked/client) [![CI](https://github.com/statebacked/react/actions/workflows/ci.yaml/badge.svg)](https://github.com/statebacked/react/actions/workflows/ci.yaml) [![Docs](https://img.shields.io/badge/docs-statebacked-blue)](https://docs.statebacked.dev/)

[StateBacked.dev](https://statebacked.dev) runs state machines as your secure, scalable, serverless backend.

Check out the full State Backed [docs](https://docs.statebacked.dev) for more detailed information and to
launch your own state machine backend in just a few minutes.

You can use these React hooks to easily connect your UI to any of your real-time,
persistent machine intances running in the State Backed cloud.

# Installation

```bash
npm install --save @statebacked/react @statebacked/client
```

# Example

```js
import { StateBackedClient } from "@statebacked/client";
import { useStateBackedMachine } from "@statebacked/react";
import { useActor } from "@xstate/react";

const client = new StateBackedClient({
  anonymous: {
    orgId: "org-YOUR_ORG_ID",
  }
});

function MyReactComponent() {
  const { actor } = useStateBackedMachine(
    client,
    {
      // name of a machine you created via the smply CLI or StateBacked.dev
      machineName: "your-machine-name",
      // name of a machine instance to connect to or create
      // you can create as many instances of each machine as you'd like
      instanceName: "your-instance",
      // function to provide the initial context if we have to create the machine instance
      getInitialContext() {
        return {
          any: "initialContextForYourMachine"
        }
      }
    }
  );

  const [state, send] = useActor(actor);

  // now you can interact with your persistent, real-time, multi-player
  // State Backed machine instance just like it was a local state machine

  // send({ type: "any-event", extra: "data" })

  // render your UI based on the current machine state
}

```
