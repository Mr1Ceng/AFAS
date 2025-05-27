/** BSpiralMaze.ts */
/** 
 * 螺旋迷宫配置接口
 */
export interface I_BSpiralMaze {
  /** 年龄  */
  age: number;

  /** 间距  */
  spacing: number;

  /** 波动程度  */
  perturbation: number;

  /** 圈数  */
  ringNumber: number;

}


/** 
 * 螺旋迷宫配置类
 */
export class C_BSpiralMaze implements I_BSpiralMaze {
  /** 年龄  */
  age: number = 0;

  /** 间距  */
  spacing: number = 0;

  /** 波动程度  */
  perturbation: number = 0;

  /** 圈数  */
  ringNumber: number = 0;

  constructor(init?: Partial<I_BSpiralMaze>) {
    Object.assign(this, init);
  }
}