import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNumber,
  Min,
  ValidateNested,
} from "class-validator";

export class ToolComponentLineDto {
  @IsInt()
  componentReferenceId: number;

  @IsNumber()
  @Min(0.0001)
  qty: number;
}

export class ReplaceToolComponentsDto {
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ToolComponentLineDto)
  items: ToolComponentLineDto[];
}
