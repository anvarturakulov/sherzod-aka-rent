import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class SetPaidInFullDto {
  @ApiProperty({
    example: true,
    description: "Возврат инструментов оплачен полностью",
  })
  @IsBoolean({ message: "paidInFull должен быть логическим значением" })
  paidInFull: boolean;
}
