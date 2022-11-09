import { Component, BaseComponent, Global } from '@jovotech/framework';
import { Action } from '../plugins/platform-zap';
import { LoveHatePizzaComponent } from './LoveHatePizzaComponent';

/*
|--------------------------------------------------------------------------
| Global Component
|--------------------------------------------------------------------------
|
| The global component handlers can be reached from anywhere in the app
| Learn more here: www.jovo.tech/docs/components#global-components
|
*/
@Global()
@Component()
export class GlobalComponent extends BaseComponent {
  LAUNCH() {
    // const request = this.$zap!.$request;

    this.$user.data.myKey = 'my value';


    this.$send({
      platforms:
      {
        zap: {
          nativeResponse: {
            platformKey: 'platform value'
          }
        }
      }
    });


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

    return this.$redirect(LoveHatePizzaComponent);
  }
}
