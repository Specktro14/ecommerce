import { TRPCError } from "@trpc/server";

import { generateSlug } from "~/lib/string.utils";
import {
  IdInput,
  IsActiveInput,
  SlugInput,
  DeleteInput,
} from "~/lib/validators";
import { db } from "~/server/db";

import { ProductRepo } from "../productos/productos.repo";
import { UnlinkInput } from "../productos/productos.validators";
import { CategoriesRepo, SubcategoriesRepo } from "./categorias.repo";
import { CategoryInsert, SubcategoryInsert } from "./categorias.tables";
import {
  CreateCategoryInput,
  CreateSubcategoryInput,
  UpdateCategoryInput,
  UpdateSubcategoryInput,
} from "./categorias.validators";

export const CategoriesService = {
  // Get
  async getCategoriesTree() {
    return await CategoriesRepo.getCategoriesTree();
  },

  async getCategoryByID(reference: IdInput) {
    const result = await CategoriesRepo.getByID(reference);
    const category = result[0];
    if (!category) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No existe esta categoría",
      });
    }
    return category;
  },

  async getSubcategoryByID(reference: IdInput) {
    const result = await SubcategoriesRepo.getByID(reference);
    const subcategory = result[0];
    if (!subcategory) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No existe esta subcategoría",
      });
    }
    return subcategory;
  },

  async getCategoryBySlug(reference: SlugInput) {
    const result = await CategoriesRepo.getBySlug(reference);
    const category = result[0];
    if (!category) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No existe esta categoría",
      });
    }
    return category;
  },

  async getSubcategoryBySlug(reference: SlugInput) {
    const result = await SubcategoriesRepo.getBySlug(reference);
    const subcategory = result[0];
    if (!subcategory) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No existe esta subcategoría",
      });
    }
    return subcategory;
  },

  // Post
  async createCategory(input: CreateCategoryInput) {
    const slug: string = generateSlug(input.name);
    const slugOcupied = await CategoriesRepo.existByCode({ slug });
    if (slugOcupied) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Ya existe una categoría parecida. EL slug ${slug} ya esta en uso`,
      });
    }

    const data: CategoryInsert = {
      slug,
      ...input,
    };
    const result = await CategoriesRepo.create(data);
    return result[0];
  },

  async createSubcategory(input: CreateSubcategoryInput) {
    const slug: string = generateSlug(input.name);
    const slugOcupied = await SubcategoriesRepo.existByCode({ slug });
    if (slugOcupied) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Ya existe una subcategoría parecida. EL slug ${slug} ya esta en uso`,
      });
    }

    const data: SubcategoryInsert = {
      slug,
      ...input,
    };
    const result = await SubcategoriesRepo.create(data);
    return result[0];
  },

  // Update
  async updateCategory(reference: IdInput, input: UpdateCategoryInput) {
    await this.getCategoryByID(reference);

    if (input.name) {
      const slug: string = generateSlug(input.name);
      const slugOcupied = await CategoriesRepo.existByCode({ slug });
      if (slugOcupied) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Ya existe una categoría parecida. EL slug ${slug} ya esta en uso`,
        });
      }

      input = {
        ...input,
        slug: slug,
      };
    }

    const result = await CategoriesRepo.update(reference, input);
    return result[0];
  },

  async updateSubcategory(reference: IdInput, input: UpdateSubcategoryInput) {
    await this.getSubcategoryByID(reference);

    if (input.name) {
      const slug: string = generateSlug(input.name);
      const slugOcupied = await SubcategoriesRepo.existByCode({ slug });
      if (slugOcupied) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Ya existe una subcategoía parecida. EL slug ${slug} ya esta en uso`,
        });
      }

      input = {
        ...input,
        slug: slug,
      };
    }

    const result = await SubcategoriesRepo.update(reference, input);
    return result[0];
  },

  async changeCategoryVisibility(input: IsActiveInput) {
    await this.getCategoryByID({ id: input.id });
    const result = await CategoriesRepo.changeVisibility(input);
    return result[0];
  },

  async changeSubcategoryVisibility(input: IsActiveInput) {
    await this.getSubcategoryByID({ id: input.id });
    const result = await SubcategoriesRepo.changeVisibility(input);
    return result[0];
  },

  // Delete
  async getDeleteCategoryPreview(reference: IdInput) {
    const category = await CategoriesRepo.getWithRelations(reference);

    if (!category) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No existe esta categoría",
      });
    }

    const productCount = category.products.length;
    const subcategoryCount = category.subcategories.length;

    return {
      category,
      subcategoryCount,
      productCount,
      strategies: ["restrict", "cascade", "transfer", "selection"],
    };
  },

  async getDeleteSubcategoryPreview(reference: IdInput) {
    const subcategory = await SubcategoriesRepo.getWithRelations(reference);
    if (!subcategory) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No existe esta subcategoría",
      });
    }

    const productCount = subcategory.products.length;

    return {
      subcategory,
      productCount,
      strategies: ["restrict", "transfer"],
    };
  },

  async deleteCategory(reference: IdInput, input: DeleteInput) {
    switch (input.mode) {
      case "cascade": {
        await this.deleteCategoryCascade(reference);
      }
      case "selection": {
        if (!input.selectedIDs) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No se ha seleccionado ninguna subcategoría",
          });
        }
        await this.deleteCategorySelection(reference, input.selectedIDs);
      }
      case "transfer": {
        if (!input.targetID) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No se ha seleccionado ninguna categoría de destino",
          });
        }
        await this.deleteCategoryTransfer(reference, { id: input.targetID });
      }
      default: {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Modo de borrado no aceptado para las categorias",
        });
      }
    }
  },

  async deleteCategoryCascade(reference: IdInput) {
    return await db.transaction(async (tx) => {
      const category = await CategoriesRepo.getWithRelations(reference, tx);
      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No existe esta categoría",
        });
      }

      // Innecesario
      const productIDs = category.products.map((product) => product.id);
      const unlinkInput: UnlinkInput = { category: true };
      await ProductRepo.bulkUnlink(productIDs, unlinkInput, tx);
      //////////////

      const subcategoriesIDs = category.subcategories.map(
        (subcategory) => subcategory.id,
      );
      await SubcategoriesRepo.bulkDelete(subcategoriesIDs, tx);

      await CategoriesRepo.delete(reference, tx);
    });
  },

  async deleteCategorySelection(reference: IdInput, selected: string[]) {
    return await db.transaction(async (tx) => {
      await SubcategoriesRepo.bulkDelete(selected, tx);
      await CategoriesRepo.delete(reference, tx);
    });
  },

  async deleteCategoryTransfer(reference: IdInput, target: IdInput) {
    return await db.transaction(async (tx) => {
      const targetCheck = await CategoriesRepo.getByID(target, tx);
      if (!targetCheck) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No existe esta categoría",
        });
      }
      if (target.id === reference.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "La categoría destino debe ser distinta",
        });
      }

      await ProductRepo.transferByCategoryID(reference, target, tx);
      await SubcategoriesRepo.transferByCategoryID(reference, target, tx);
      await CategoriesRepo.delete(reference, tx);
    });
  },

  async deleteSubcategory(reference: IdInput) {
    await this.getSubcategoryByID(reference);
    const result = await SubcategoriesRepo.delete(reference);
    return result[0];
  },
};
