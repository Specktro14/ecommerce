import { stringToIntPrices } from "./string.utils"

export interface ItemTotalFrontendData {
  price: string
  quantity: string
  estimatedWeight?: string
}

export function calculateItemTotal(data: ItemTotalFrontendData) {
  const price = stringToIntPrices(data.price)
  const quantity = 
  if (data.estimatedWeight) {
  } else {}
}