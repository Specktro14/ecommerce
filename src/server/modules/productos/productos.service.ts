import { TRPCError } from "@trpc/server";

import { generateSlug, generateSku } from "~/lib/string.utils";
import { isNegative } from "~/lib/number.utils"
import { IdInput } from "~/lib/validators";
import { db } from "~/server/db/index";

import { ProductRepo, VariantRepo, ImageRepo } from "./productos.repo";
import {
  CreateProductInput,
  UpdateProductInput,
  CreateProductVariantInput,
  FilterCatalogInput,
  StockChangeInput,
  AddImageInput,
} from "./productos.validators";

export const ProductService = {
  async getPublicCatalog(filters: FilterCatalogInput) {
    return await ProductRepo.getPublicCatalog(filters);
  },

  async getAdminCatalog() {
    return await ProductRepo.getAdminCatalog();
  },

  async getProductDetails(reference: IdInput) {
    const product = await ProductRepo.getById(reference);
    if (!product) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Producto no encontrado",
      });
    }
    return product;
  },

  async getVariantByID(reference: IdInput) {
    const variant = await VariantRepo.getById(reference);
    if (!variant) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No existe esta variante"
      })
    }
    return variant
  },

  async createProductWithVariant(admin: string, data: CreateProductInput) {
    const generatedSlug = generateSlug(data.name);
    if (await ProductRepo.existByCode({ slug: generatedSlug })) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Ya existe un producto con el slug ${generatedSlug}`,
      });
    }

    const generatedSku = generateSku({
      name: data.baseVariant.name,
      weight: data.baseVariant.weight,
      unit: data.baseVariant.weightUnit,
    });
    if (await VariantRepo.existByCode({ sku: generatedSku })) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Ya existe una variante con el sku ${generatedSku}`,
      });
    }

    return await db.transaction(async (tx) => {
      const newProduct = await ProductRepo.create(
        {
          categoryID: data.categoryID,
          subcategoryID: data.subcategoryID,
          name: data.name,
          slug: generatedSlug,
          description: data.description,
          shortDescription: data.shortDescription,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          createdBy: admin,
        },
        tx,
      );

      const newVariant = await VariantRepo.create(
        {
          ...data.baseVariant,
          productID: newProduct[0].id,
          sku: generatedSku,
        },
        tx,
      );

      if (data.baseVariant.stock > 0) {
        await VariantRepo.logStockChange(
          {
            productVariantID: newVariant[0].id,
            quantityVariation: data.baseVariant.stock,
            reason: "RECEPCION",
            notes: "Inventario inicial de la variante",
            createdBy: admin,
          },
          tx,
        );
      }

      await VariantRepo.logPriceChange(
        {
          productVariantID: newVariant[0].id,
          pricePerUnit: data.baseVariant.pricePerUnit,
          pricePerKG: data.baseVariant.pricePerKG,
          reason: "Precio inicial",
          createdBy: admin,
        },
        tx,
      );

      return { product: newProduct[0], variant: newVariant[0] };
    });
  },

  async updateProduct(reference: IdInput, data: UpdateProductInput) {
    await this.getProductDetails(reference);

    if (data.slug) {
      if (await ProductRepo.existByCode({ slug: data.slug })) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `El slug ${data.slug} ya esta en uso`,
        });
      }

      const product = await ProductRepo.update(reference, data);
      return product[0];
    } else if (data.name) {
      const generatedSlug = generateSlug(data.name);
      if (await ProductRepo.existByCode({ slug: generatedSlug })) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `El slug ${generatedSlug} ya esta en uso`,
        });
      }

      const product = await ProductRepo.update(reference, {
        slug: generatedSlug,
        ...data,
      });
      return product[0];
    }
  },

  async deleteProduct(admin: string, reference: IdInput) {
    const product = await this.getProductDetails(reference);
    if (!product) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No existe el producto",
      });
    }

    return await db.transaction(async (tx) => {
      for (const variant of product.variants) {
        if (variant.stock && variant.stock > 0) {
          await VariantRepo.logStockChange(
            {
              productVariantID: variant.id,
              quantityVariation: -variant.stock,
              reason: "AJUSTE_MANUAL",
              notes: `Vaciado por eliminación del producto padre (${product.name})`,
              createdBy: admin,
            },
            tx,
          );
        }

        // Dejamos huella del último precio
        await VariantRepo.logPriceChange(
          {
            productVariantID: variant.id,
            pricePerUnit: variant.pricePerUnit?.toString(),
            pricePerKG: variant.pricePerKG?.toString(),
            reason: "Precio de cierre (Producto eliminado)",
            createdBy: admin,
          },
          tx,
        );
      }

      await ProductRepo.delete(reference, tx);

      return { success: true, message: "Producto eliminado correctamente" };
    });
  },

  async createVariant(admin: string, data: CreateProductVariantInput) {
    await this.getProductDetails({ id: data.productID });
    const generatedSku = generateSku({
      name: data.name,
      weight: data.weight,
      unit: data.weightUnit,
    });

    if (await VariantRepo.existByCode({ sku: generatedSku })) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Ya existe una variante con el sku ${generatedSku}`,
      });
    }

    return await db.transaction(async (tx) => {
      const newVariant = await VariantRepo.create(
        {
          ...data,
          sku: generatedSku,
        },
        tx,
      );

      if (data.stock > 0) {
        await VariantRepo.logStockChange(
          {
            productVariantID: newVariant[0].id,
            quantityVariation: data.stock,
            reason: "RECEPCION",
            notes: "Inventario inicial de la variante",
            createdBy: admin,
          },
          tx,
        );
      }

      await VariantRepo.logPriceChange(
        {
          productVariantID: newVariant[0].id,
          pricePerUnit: data.pricePerUnit,
          pricePerKG: data.pricePerKG,
          reason: "Precio inicial",
          createdBy: admin,
        },
        tx,
      );

      return newVariant[0];
    });
  },

  async updateVariantStock(admin: string, data: StockChangeInput) {
    return await db.transaction(async (tx) => {
      const variant = await VariantRepo.getById(
        { id: data.productVariantID },
        tx,
      );
      if (!variant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No existe esta variante",
        });
      }

      const stock = data.quantityVariation + (variant.stock ?? 0);
      if (isNegative(stock)) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "El stock de un producto no puede ser negativo"
        })
      }

      await VariantRepo.update(
        { id: data.productVariantID },
        { stock: stock },
        tx,
      );

      await VariantRepo.logStockChange(
        {
          createdBy: admin,
          ...data,
        },
        tx,
      );
    });
  },

  //updatePrice

  async deleteVariant(admin: string, reference: IdInput) {
    const variant = await VariantRepo.getById(reference);
    if (!variant) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No existe la variante del producto",
      });
    }

    return await db.transaction(async (tx) => {
      await VariantRepo.logStockChange(
        {
          productVariantID: variant.id,
          quantityVariation: 0,
          reason: "ELIMINACION",
          notes: "Eliminando variante del comercio",
          createdBy: admin,
        },
        tx,
      );

      await VariantRepo.logPriceChange(
        {
          productVariantID: variant.id,
          pricePerUnit: variant.pricePerUnit?.toString(),
          pricePerKG: variant.pricePerKG?.toString(),
          reason: "Precio final para pedidos restantes",
          createdBy: admin,
        },
        tx,
      );

      const result = await VariantRepo.delete(reference);
      return result[0];
    });
  },

  async addProductImage(adminId: string, input: AddImageInput) {
    // 1. Validar que el producto padre existe
    const productExists = await ProductRepo.getById({ id: input.productID });
    if (!productExists) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "El producto asignado no existe.",
      });
    }

    // 2. Si la imagen es específica de una variante (ej. el cartón de leche desnatada), validar que exista
    if (input.productVariantID) {
      const variantExists = await VariantRepo.getById({
        id: input.productVariantID,
      });
      if (!variantExists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "La variante asignada no existe.",
        });
      }
    }

    // 3. Insertar en la base de datos
    const newImage = await ImageRepo.create({
      productID: input.productID,
      productVariantID: input.productVariantID, // Puede ser undefined
      url: input.url,
      type: input.type || "GALLERY", // Por defecto a la galería
      order: input.order || 0,
      isActive: true,
    });

    return newImage[0];
  },

  async deleteProductImage(imageId: string) {
    // 1. Verificamos que la imagen está en la base de datos
    const imageExists = await ImageRepo.getById({ id: imageId });
    if (!imageExists) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "La imagen no existe o ya fue eliminada.",
      });
    }

    // 2. Borramos el registro de la base de datos
    await ImageRepo.delete({ id: imageId });

    // 💡 NOTA PARA EL FUTURO:
    // Aquí es donde deberías añadir el código para borrar el archivo físico de tu servidor de imágenes (AWS S3, Cloudinary, Uploadthing).
    // Ejemplo ficticio: await s3Client.deleteFile(imageExists.url);

    return {
      success: true,
      message: "Imagen desvinculada correctamente del producto.",
    };
  },
};
