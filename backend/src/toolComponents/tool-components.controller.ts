import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/auth/roles-auth.decorator";
import { RolesGuard } from "src/auth/roles.guard";
import { ReplaceToolComponentsDto } from "./dto/replace-tool-components.dto";
import { ToolComponentsService } from "./tool-components.service";

@ApiTags("Состав колонны")
@Controller("tool-components")
export class ToolComponentsController {
  constructor(private readonly service: ToolComponentsService) {}

  @ApiOperation({ summary: "Норма состава колонны" })
  @Roles("ALL")
  @UseGuards(RolesGuard)
  @Get(":referenceId")
  list(@Param("referenceId", ParseIntPipe) referenceId: number) {
    return this.service.listByParent(referenceId);
  }

  @ApiOperation({ summary: "Заменить норму состава колонны" })
  @Roles("ALL")
  @UseGuards(RolesGuard)
  @Put(":referenceId")
  replace(
    @Param("referenceId", ParseIntPipe) referenceId: number,
    @Body() dto: ReplaceToolComponentsDto,
  ) {
    return this.service.replace(referenceId, dto.items || []);
  }
}
