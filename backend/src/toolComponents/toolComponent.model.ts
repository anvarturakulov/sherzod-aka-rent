import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Reference } from "src/references/reference.model";

export interface ToolComponentCreationAttrs {
  parentReferenceId: number;
  componentReferenceId: number;
  qty: number;
}

@Table({ tableName: "tool_components" })
export class ToolComponent extends Model<
  ToolComponent,
  ToolComponentCreationAttrs
> {
  @Column({ type: DataType.BIGINT, autoIncrement: true, primaryKey: true })
  id: number;

  @ForeignKey(() => Reference)
  @Column({ type: DataType.INTEGER, allowNull: false })
  parentReferenceId: number;

  @BelongsTo(() => Reference, "parentReferenceId")
  parent: Reference;

  @ForeignKey(() => Reference)
  @Column({ type: DataType.INTEGER, allowNull: false })
  componentReferenceId: number;

  @BelongsTo(() => Reference, "componentReferenceId")
  component?: Reference;

  @Column({ type: DataType.DOUBLE, allowNull: false, defaultValue: 1 })
  qty: number;
}
