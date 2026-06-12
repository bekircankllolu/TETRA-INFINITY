import { useWindowDimensions } from 'react-native';
import { COLS, VISIBLE_ROWS } from '../core/constants';

export interface BoardMetrics {
  cellSize: number;
  boardWidth: number;
  boardHeight: number;
}

/**
 * Hücre boyutu ekrandan hesaplanır: yanlarda hold/next panellerine,
 * altta kontrol butonlarına yer bırakılır. Tam sayıya yuvarlanır ki
 * hücreler arasında çatlak oluşmasın.
 */
export function useBoardMetrics(): BoardMetrics {
  const { width, height } = useWindowDimensions();
  const maxByWidth = (width - 150) / COLS; // 150: hold + next panelleri
  const maxByHeight = (height - 320) / VISIBLE_ROWS; // 320: HUD + butonlar + boşluklar
  const cellSize = Math.max(10, Math.floor(Math.min(maxByWidth, maxByHeight)));
  return {
    cellSize,
    boardWidth: cellSize * COLS,
    boardHeight: cellSize * VISIBLE_ROWS,
  };
}
