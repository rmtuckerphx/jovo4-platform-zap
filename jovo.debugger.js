const { DebuggerConfig } = require('@jovotech/plugin-debugger');

const debuggerConfig = new DebuggerConfig({
  locales: ['en'],
  buttons: [
    {
      label: 'LAUNCH',
      input: {
        type: 'LAUNCH',
      },
    },
    {
      label: 'LAUNCH Zap',
      request: {
        locale: 'en',
        version: '1.0',
        id: 'request-1',
        timestamp: '2022-11-07T22:16:08.197Z',
        platform: 'zap',
        context: {
          device: {
            id: 'device-1',
            capabilities: [
              'AUDIO', 'SCREEN'
            ],
          },
          session: {
            id: 'session-1',
            data: {
              customKey: 'session value'
            }
          },
          user: {
            id: 'user-1',
            data: {
              customKey: 'user value'
            }
          },
          custom: {
            data: {
              myKey: 'value1'
            }
          }
        },
       input: {
        type: 'LAUNCH'
       }
      },
    },
    {
      label: 'Yes',
      input: {
        intent: 'YesIntent',
      },
    },
    {
      label: 'No',
      input: {
        intent: 'NoIntent',
      },
    },
    // ...
  ],
});

module.exports = debuggerConfig;
