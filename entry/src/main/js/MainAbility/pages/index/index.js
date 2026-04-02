import { ScreenState } from '../../common/constants/screen-state';
import router from '@ohos.router';

export default {
    data: {
        screenState: ScreenState.START,
        isStartScreen: true,
        isGameScreen: false,
        currentLevel: 1,
        pinsText: 'Pins 3',
        prePlacedText: 'Pre-placed 0',
        hintText: 'Tap to shoot'
    },

    onInit() {

    },

    onHide() {
        this.clearInitTimer();
        if (this.engine) {
            this.engine.stopLoop();
        }
    },

    onDestroy() {
        this.clearInitTimer();
        if (this.engine) {
            this.engine.stopLoop();
        }
    },

    startNewGame() {
        router.replace({
            uri: `pages/game/game`
        })
    }

}