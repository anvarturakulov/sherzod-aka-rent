import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { AuthModule } from "src/auth/auth.module";
import { RefValues } from "src/refvalues/refValues.model";
import { Reference } from "src/references/reference.model";
import { UsersModule } from "src/users/users.module";
import { ToolComponent } from "./toolComponent.model";
import { ToolComponentsController } from "./tool-components.controller";
import { ToolComponentsService } from "./tool-components.service";

@Module({
  imports: [
    SequelizeModule.forFeature([ToolComponent, Reference, RefValues]),
    AuthModule,
    UsersModule,
  ],
  controllers: [ToolComponentsController],
  providers: [ToolComponentsService],
  exports: [ToolComponentsService],
})
export class ToolComponentsModule {}
