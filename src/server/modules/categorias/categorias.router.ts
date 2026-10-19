import {
  idSchema,
  slugSchema,
  isActiveSchema,
  deleteSchema,
} from "~/lib/validators";
import { publicProcedure, adminProcedure, router } from "~/server/trpc/trpc";

import { CategoriesService } from "./categorias.service";
import {
  createCategorySchema,
  createSubcategorySchema,
  updateCategorySchema,
  updateSubcategorySchema,
} from "./categorias.validators";

export const CategoriasRouter = router({
  // Get routes
  getCategoriesTree: publicProcedure
    .query(async () => {
      return await CategoriesService.getCategoriesTree();
    }),

  getCategoryByID: publicProcedure
    .input(idSchema)
    .query(async ({ input }) => {
      return await CategoriesService.getCategoryByID(input);
    }),

  getSubcategoryByID: publicProcedure
    .input(idSchema)
    .query(async ({ input }) => {
      return await CategoriesService.getSubcategoryByID(input);
    }),

  getCategoryBySlug: publicProcedure
    .input(slugSchema)
    .query(async ({ input }) => {
      return await CategoriesService.getCategoryBySlug(input);
    }),

  getSubcategoryBySlug: publicProcedure
    .input(slugSchema)
    .query(async ({ input }) => {
      return await CategoriesService.getSubcategoryBySlug(input);
    }),

  // Create routes
  createCategory: adminProcedure
    .input(createCategorySchema)
    .mutation(async ({ input }) => {
      return await CategoriesService.createCategory(input);
    }),

  createSubcategory: adminProcedure
    .input(createSubcategorySchema)
    .mutation(async ({ input }) => {
      return await CategoriesService.createSubcategory(input);
    }),

  // Update routes
  updateCategory: adminProcedure
    .input(updateCategorySchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await CategoriesService.updateCategory({ id: id }, data);
    }),

  updateSubcategory: adminProcedure
    .input(updateSubcategorySchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await CategoriesService.updateSubcategory({ id: id }, data);
    }),

  changeCategoryVisibility: adminProcedure
    .input(isActiveSchema)
    .mutation(async ({ input }) => {
      return await CategoriesService.changeCategoryVisibility(input);
    }),

  changeSubcategoryVisibility: adminProcedure
    .input(isActiveSchema)
    .mutation(async ({ input }) => {
      return await CategoriesService.changeSubcategoryVisibility(input);
    }),

  // Delete routes
  getDeleteCategoryPreview: adminProcedure
    .input(idSchema)
    .query(async ({ input }) => {
      return await CategoriesService.getDeleteCategoryPreview(input);
    }),

  getDeleteSubcategoryPreview: adminProcedure
    .input(idSchema)
    .query(async ({ input }) => {
      return await CategoriesService.getDeleteSubcategoryPreview(input);
    }),

  deleteCategory: adminProcedure
    .input(deleteSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await CategoriesService.deleteCategory({ id: id }, data);
    }),

  deleteSubcategory: adminProcedure
    .input(idSchema)
    .mutation(async ({ input }) => {
      return await CategoriesService.deleteSubcategory(input);
    }),
});
