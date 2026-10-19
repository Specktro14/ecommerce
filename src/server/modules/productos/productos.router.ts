import { idSchema } from "~/lib/validators";
import { router, publicProcedure, adminProcedure } from "~/server/trpc/trpc";

import { ProductService } from "../productos/productos.service";
import {
  createProductSchema,
  updateProductSchema,
  createProductVariantSchema,
  filterCatalogSchema,
  addImageSchema,
  logStockChangeSchema,
} from "../productos/productos.validators";

export const productsRouter = router({
  // ==========================================
  // 🛍️ RUTAS PÚBLICAS (Escaparate para Clientes)
  // ==========================================

  getPublicCatalog: publicProcedure
    .input(filterCatalogSchema)
    .query(async ({ input }) => {
      return await ProductService.getPublicCatalog(input);
    }),

  getProductDetails: publicProcedure
    .input(idSchema)
    .query(async ({ input }) => {
      return await ProductService.getProductDetails(input);
    }),

  // ==========================================
  // 👔 RUTAS DE ADMINISTRACIÓN (Protegidas)
  // ==========================================

  // --- Consultas ---
  getAdminCatalog: adminProcedure.query(async () => {
    return await ProductService.getAdminCatalog();
  }),

  // --- Gestión de Productos Padre ---
  createProduct: adminProcedure
    .input(createProductSchema)
    .mutation(async ({ ctx, input }) => {
      // Usamos el ID del administrador desde la sesión para los logs de creación
      return await ProductService.createProductWithVariant(
        ctx.session.id,
        input,
      );
    }),

  updateProduct: adminProcedure
    .input(updateProductSchema.extend(idSchema.shape))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await ProductService.updateProduct({ id: id }, data);
    }),

  deleteProduct: adminProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      // Pasamos el adminId para registrar el vaciado de stock contable antes de borrar
      return await ProductService.deleteProduct(ctx.session.id, input);
    }),

  // --- Gestión de Variantes e Inventario ---
  addVariant: adminProcedure
    .input(createProductVariantSchema)
    .mutation(async ({ ctx, input }) => {
      return await ProductService.createVariant(ctx.session.id, input);
    }),

  updateStock: adminProcedure
    .input(logStockChangeSchema)
    .mutation(async ({ ctx, input }) => {
      return await ProductService.updateVariantStock(ctx.session.id, input);
    }),

  deleteVariant: adminProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      // Pasamos el adminId para registrar la merma en caso de que quede stock
      return await ProductService.deleteVariant(ctx.session.id, input);
    }),

  // --- Gestión de Imágenes ---
  addImage: adminProcedure
    .input(addImageSchema)
    .mutation(async ({ ctx, input }) => {
      return await ProductService.addProductImage(ctx.session.id, input);
    }),

  deleteImage: adminProcedure.input(idSchema).mutation(async ({ input }) => {
    return await ProductService.deleteProductImage(input.id);
  }),
});
