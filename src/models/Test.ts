/** 
 * 测试接口
 */
export interface I_Test {
  /** col1  */
  col1: string;

  /** col2  */
  col2: number;

  /** col3  */
  col3: number;

  /** col4  */
  col4: number;

  /** col5 decimal(6,2) */
  col5: number;

  /** col6  */
  col6: boolean;

  /** col7  */
  col7: Date;

  /** col8  */
  col8: Date;

  /** col9  */
  col9: string;

}


/** 
 * 测试类
 */
export class C_Test implements I_Test {
  /** col1  */
  col1: string = "";

  /** col2  */
  col2: number = 0;

  /** col3  */
  col3: number = 0;

  /** col4  */
  col4: number = 0;

  /** col5 decimal(6,2) */
  col5: number = 0;

  /** col6  */
  col6: boolean = false;

  /** col7  */
  col7: Date = new Date();

  /** col8  */
  col8: Date = new Date();

  /** col9  */
  col9: string = "";

  constructor(init?: Partial<I_Test>) {
    Object.assign(this, init);
  }
}