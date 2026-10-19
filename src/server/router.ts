import { productsRouter } from "./modules/productos/productos.router"
import { router } from "./trpc/trpc"

export const appRouter = router({
  products: productsRouter,
  
})