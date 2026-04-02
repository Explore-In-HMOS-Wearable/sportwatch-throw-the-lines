import { GameController } from '../../lib/game_controller';
import { GameRenderer } from '../../lib/game_renderer';

export default {
    data: {
        gameController: null,
        gameRenderer: null,
        bottomText: 'tap to shoot',
        isLevelComplete: false,
        isGameOver: false
    },
    onShow() {
        const el = this.$refs.gameCanvas;
        const context = el.getContext('2d');
        this.gameRenderer = new GameRenderer(context);
        this.gameController = GameController.getInstance(this.gameRenderer);
        this.gameController.startGame();
        this.gameController.onStatusChange = (status) => {
            this.isLevelComplete = (status === 'levelcomplete');
            this.isGameOver = (status === 'gameover');
            if (status === 'waiting') {
                this.bottomText = 'tap to shoot';
            }
            else if (status === 'shooting') {
                this.bottomText = '';
            }
            else if (status === 'levelcomplete') {
                this.bottomText = 'tap for next level';
            }
            else if (status === 'gameover') {
                this.bottomText = 'tap to retry';
            }
        };
    },
    onTouchEnd(e) {
        this.gameController.onTouchEnd(e);
    },
    onDestroy() {
        this.gameController.stopGame();
    },
    onInit() {
    }

};
