import { GAME_CONFIG, COLORS } from './constants';
import { GameStatus } from './game_controller';

export class GameRenderer {
    constructor(context) {
        this.context = context;
    }

    drawGame(state) {
        const ctx = this.context;
        const cx = GAME_CONFIG.CENTER_X;
        const cy = GAME_CONFIG.CENTER_Y;
        const r = GAME_CONFIG.CIRCLE_RADIUS;

        if (state.status === GameStatus.levelcomplete) {
            ctx.fillStyle = COLORS.bgPassed;
        } else if (state.status === GameStatus.gameover) {
            ctx.fillStyle = COLORS.bgFailed;
        } else {
            ctx.fillStyle = COLORS.bg;
        }
        ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

        ctx.fillStyle = COLORS.dark;
        for (let dy = -r; dy <= r; dy++) {
            let w = Math.sqrt(r * r - dy * dy) * 2;
            ctx.fillRect(cx - w / 2, cy + dy, w, 1);
        }
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.strokeStyle = COLORS.dark;
        ctx.lineWidth = 2;
        ctx.stroke();

        for (let i = 0; i < state.stuckPins.length; i++) {
            let angle = state.stuckPins[i] + state.rotationAngle;
            let isCollision = (state.status === GameStatus.gameover && i === state.collisionPinIndex);
            this._drawStuckPin(ctx, cx, cy, angle, COLORS.dark);
        }

        if (state.shootingPin.active) {
            this._drawMovingPin(ctx, state.shootingPin.x, state.shootingPin.y);
        } else if (state.status === GameStatus.waiting) {
            this._drawReadyPin(ctx);
        }

        if (state.status === GameStatus.levelcomplete) {
            ctx.fillStyle = COLORS.dark;
            ctx.font = 'bold 52px sans-serif';
            ctx.fillText('PASSED', 175, GAME_CONFIG.CANVAS_HEIGHT - 65);
        } else if (state.status === GameStatus.gameover) {
            ctx.fillStyle = COLORS.dark;
            ctx.font = 'bold 52px sans-serif';
            ctx.fillText('FAIL', 195, GAME_CONFIG.CANVAS_HEIGHT - 65);
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 78px sans-serif';
        ctx.fillText('' + (state.level + 1), cx - 4, cy - 18);
    }

    _drawStuckPin(ctx, cx, cy, angle, color) {
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);
        let r = GAME_CONFIG.CIRCLE_RADIUS;
        let inner = r - GAME_CONFIG.PIN_INNER_LENGTH;
        let outer = r + GAME_CONFIG.PIN_OUTER_LENGTH;
        const DOT_R = 8;

        let lineEndX = cx + cos * (outer - DOT_R);
        let lineEndY = cy + sin * (outer - DOT_R);
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineCap = 'butt';
        ctx.moveTo(cx + cos * inner, cy + sin * inner);
        ctx.lineTo(lineEndX, lineEndY);
        ctx.stroke();
        ctx.closePath();

        let dotX = cx + cos * outer;
        let dotY = cy + sin * outer;
        ctx.beginPath();
        ctx.arc(dotX, dotY, DOT_R, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
    }

    _drawMovingPin(ctx, x, y) {
        ctx.beginPath();
        ctx.strokeStyle = COLORS.dark;
        ctx.lineWidth = 2;
        ctx.moveTo(x, y + 14);
        ctx.lineTo(x, y - 40);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(x, y - 4, 3, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.dark;
        ctx.fill();
        ctx.closePath();
    }

    _drawReadyPin(ctx) {
        let x = GAME_CONFIG.SHOOT_START_X;
        let y = GAME_CONFIG.SHOOT_START_Y;

        ctx.beginPath();
        ctx.strokeStyle = COLORS.dark;
        ctx.lineWidth = 2;
        ctx.moveTo(x, y + 14);
        ctx.lineTo(x, y - 40);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(x, y - 6, 3, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.dark;
        ctx.fill();
        ctx.closePath();
    }
}