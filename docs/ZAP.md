# Zap

We will be creating a Jovo platform plugin for a fictional product called Zap to control a space heater by voice.

## Jovo Platform Overview

Jovo accepts a platform-specific request and optionally passes it through ASR and NLU to get an intent and optional entities. The request passes through a pipeline (middleware) and is routed to a handler (based on the input type or intent). The handler produces output which is converted to a platform-specific response.

You can create your own platform-specific requests and responses easily by basing them on the Jovo-provided CorePlatform. This is what the WebPlatform does: https://github.com/jovotech/jovo-framework/blob/v4/latest/platforms/platform-web/src/index.ts

Notice all the places in the file where "web", "$web" or "WebPlatform" are used.

## Creating ZapPlatform

We will base the Zap platform on CorePlatform plus add some more strong typing to the output. You can find the code at [ZapPlatform](../src/plugins/platform-zap/index.ts)

The following code defines the new platform and config on those defined in Core:

```ts
declare module '@jovotech/framework/dist/types/Extensible' {
  interface ExtensiblePluginConfig {
    ZapPlatform?: CorePlatformConfig<'zap'>;
  }

  interface ExtensiblePlugins {
    ZapPlatform?: CorePlatform<'zap'>;
  }
}
```

This code defines the `$zap` property on the Jovo object:

```ts
declare module '@jovotech/framework/dist/types/Jovo' {
  interface Jovo {
    $zap?: Core;
  }
}
```

It allows you to check if the request is for the Zap platform:

```ts
if (this.$zap) {
  // ...
}
```

You can also get the orginal request `this.$zap!.$request`

This code is typically how output is defined:

```ts
declare module '@jovotech/framework/dist/types/index' {
  interface NormalizedOutputTemplatePlatforms {
    zap?: NormalizedCoreOutputTemplate;
  }
}
```

For our example, we are going to extend the CoreResponse with `ZapAction[]`:

```ts
export enum Action {
  On = 'ACTION_ON',
  Off = 'ACTION_OFF',
  Temperature = 'ACTION_TEMP',
  Oscillation = 'ACTION_OSCILLATION',
}

export interface ZapAction {
  type: Action;
  data?: UnknownObject;
}

export interface ZapOutputTemplate extends NormalizedCoreOutputTemplate {
  actions?: ZapAction[];
}

declare module '@jovotech/framework/dist/types/index' {
  interface NormalizedOutputTemplatePlatforms {
    zap?: ZapOutputTemplate;
  }
}
```

The code that actually creates the new ZapPlatform is:

```ts
export const ZapPlatform = CorePlatform.createCustomPlatform('ZapPlatform', 'zap');
export * from '@jovotech/platform-core';
```

Then in the [app.ts](../src/app.ts) file, you create an instance of the plugin:

```ts
  plugins: [
    new ZapPlatform(),
  ],
```

## Zap Request

The minimum JSON request needed for Jovo to recognize the request as a Zap request is:

```ts
{
  request: {
    version: '1.0',
    timestamp: '2022-11-07T22:16:08.197Z',
    platform: 'zap',
    input: {
      type: ''
    }
  }
}
```

The `input.type` values can be found [here](https://www.jovo.tech/docs/input#default-input-types) but it should be possible to define your own values.

There are lots of additional properties that can passed with the [CoreRequest](https://github.com/jovotech/jovo-framework/blob/v4/latest/platforms/platform-core/src/CoreRequest.ts).

Typically, the client will set the `id` property of the **request** to a `uuid` as well as pass an `id` for the **device**, **session** and **user**:

```ts
{
    id: 'my-request-id',
    version: '1.0',
    timestamp: '2022-11-07T22:16:08.197Z',
    platform: 'zap',
    input: {
        type: 'LAUNCH'
    },
    locale: 'en',
    context: {
        device: {
            id: 'my-device-id',
            capabilities: ['AUDIO', 'SCREEN'],
        },
        session: {
            id: 'my-session-id',
            data: {
                customKey: 'session value'
            }
        },
        user: {
            id: 'my-user-id',
            data: {
                customKey: 'user value'
            }
        },
        myCustom: {
            data: {
                myKey: 'value1'
            }
        }
    }
}
```

You can extend the request further as shown with the `myCustom` property.

NOTES:

- Typically you won't have the client set `user.data` because Jovo keeps track of user storage.
- You can pass data from the client to the Jovo app using `session.data` and remember to get the session from the response and pass it to the next request.

## Zap Response

The minimum Core response is:

```ts
{
  version: '4.0.0',
  platform: 'zap',
  output: [],
  context: {
    request: {},
    session: {
      end: false,
      id: '',
      data: {},
      state: []
    },
    user: {
      data: {},
    },
  },
}
```

The response has a built-in extensibility mechanism by allowing a `nativeResponse` for each platform where you can specify as many key/value pairs as you want:

```ts
this.$send({
  platforms: {
    zap: {
      nativeResponse: {
        platformKey: 'platform value',
      },
    },
  },
});
```

For this Zap example there is a typed `actions` property that can be used like this:

```ts
this.$send({
  platforms: {
    zap: {
      actions: [
        {
          type: Action.Oscillation,
          data: {
            delay: 3000,
          }
        },
        {
          type: Action.Temperature,
          data: {
            value: 100
          }
        }
      ]
    }
  }
});
```

In the response returned from Jovo, you will see:

```json
{
  "version": "4.0.0",
  "platform": "zap",
  "output": [
    {
      "platforms": {
        "zap": {
          "nativeResponse": {
            "platformKey": "platform value"
          }
        }
      }
    },
    {
      "platforms": {
        "zap": {
          "actions": [
            {
              "type": "ACTION_OSCILLATION",
              "data": {
                "delay": 3000
              }
            },
            {
              "type": "ACTION_TEMP",
              "data": {
                "value": 100
              }
            }
          ]
        }
      }
    },
    {
      "message": "Do you like pizza?",
      "listen": true,
      "quickReplies": [
        "yes",
        "no"
      ]
    }
  ],
  "context": {
    "request": {},
    "session": {
      "end": false,
      "data": {
        "customKey": "session value"
      },
      "id": "session-1",
      "state": [
        {
          "component": "LoveHatePizzaComponent"
        }
      ]
    },
    "user": {
      "data": {}
    }
  }
}
```

NOTE: The reason you see three items in the `output` array is because there were three calls to `this.$send()` (2 in GlobalComponent and 1 in LoveHatePizzaComponent).

## Jovo Debugger

The Jovo Debugger is a platform plugin derived from CorePlatform and has similar formats for the request and response JSON. Much of the early testing of your Jovo app can be done with the Jovo Debugger.

Learn more in the [Jovo Debugger docs](https://www.jovo.tech/docs/debugger). The Jovo Debugger uses NLP.js by default when you type text into the input box. See https://www.jovo.tech/docs/debugger#nlu

You can also customize the [Jovo Debugger configuration](https://www.jovo.tech/docs/debugger#debugger-customization) by adding buttons.

Here is an example of setting a custom Zap request on [line 13](../jovo.debugger.js)