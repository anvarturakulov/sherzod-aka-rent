import {
  BadRequestException,
  Injectable,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { TypeReference, TypeTMZ } from "src/interfaces/reference.interface";
import { RefValues } from "src/refvalues/refValues.model";
import { Reference } from "src/references/reference.model";
import { ToolComponentLineDto } from "./dto/replace-tool-components.dto";
import { ToolComponent } from "./toolComponent.model";

@Injectable()
export class ToolComponentsService {
  constructor(
    @InjectModel(ToolComponent)
    private readonly componentModel: typeof ToolComponent,
    @InjectModel(Reference)
    private readonly referenceModel: typeof Reference,
  ) {}

  async listByParent(parentReferenceId: number): Promise<ToolComponent[]> {
    return this.componentModel.findAll({
      where: { parentReferenceId },
      order: [["id", "ASC"]],
    });
  }

  async listAll(): Promise<ToolComponent[]> {
    return this.componentModel.findAll({ order: [["id", "ASC"]] });
  }

  async listByParentIds(parentIds: number[]): Promise<ToolComponent[]> {
    const ids = [...new Set(parentIds.filter((id) => id > 0))];
    if (!ids.length) return [];
    return this.componentModel.findAll({
      where: { parentReferenceId: { [Op.in]: ids } },
      order: [["id", "ASC"]],
    });
  }

  async replace(
    parentReferenceId: number,
    items: ToolComponentLineDto[],
  ): Promise<ToolComponent[]> {
    await this.assertTool(parentReferenceId, "Колонна");

    const unique = new Map<number, number>();
    for (const item of items || []) {
      const componentId = Number(item.componentReferenceId);
      const qty = Number(item.qty);
      if (!componentId || !(qty > 0)) {
        throw new BadRequestException("В составе укажите деталь и количество");
      }
      if (componentId === parentReferenceId) {
        throw new BadRequestException("Колонна не может входить сама в себя");
      }
      if (unique.has(componentId)) {
        throw new BadRequestException("Деталь в составе указана дважды");
      }
      unique.set(componentId, qty);
    }

    const componentIds = [...unique.keys()];
    if (componentIds.length) {
      for (const componentId of componentIds) {
        await this.assertTool(componentId, "Деталь");
      }
      const nested = await this.componentModel.count({
        where: { parentReferenceId: { [Op.in]: componentIds } },
      });
      if (nested > 0) {
        throw new BadRequestException(
          "Деталь состава не может быть другой колонной",
        );
      }
      const usedAsPart = await this.componentModel.count({
        where: { componentReferenceId: parentReferenceId },
      });
      if (usedAsPart > 0) {
        throw new BadRequestException(
          "Эта карточка уже входит в состав другой колонны",
        );
      }
    }

    await this.componentModel.destroy({ where: { parentReferenceId } });
    if (componentIds.length) {
      await this.componentModel.bulkCreate(
        componentIds.map((componentReferenceId) => ({
          parentReferenceId,
          componentReferenceId,
          qty: unique.get(componentReferenceId)!,
        })),
      );
    }
    return this.listByParent(parentReferenceId);
  }

  private async assertTool(id: number, label: string): Promise<Reference> {
    const ref = await this.referenceModel.findByPk(id, {
      include: [RefValues],
    });
    if (
      !ref ||
      ref.typeReference !== TypeReference.TMZ ||
      ref.refValues?.typeTMZ !== TypeTMZ.TOOLS ||
      ref.isFolder
    ) {
      throw new BadRequestException(`${label} должна быть карточкой инструмента`);
    }
    return ref;
  }
}
