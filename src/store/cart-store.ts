import { createStore } from "solid-js/store";

interface CartProduct {
  id: string;
  title: string;
  quantity: string;
  totalPrice: string;
}

interface CartState {
  products: CartProduct[];
}

const initialState: CartState = {
  products: [],
};

const [state, setState] = createStore<CartState>({ ...initialState });

function addProduct(product: CartProduct) {
  setState((prev) => {
    prev.products.push(product);
    return prev;
  });
}

function deleteProduct(key: number) {
  setState((prev) => {
    prev.products.splice(key, 1);
    return prev;
  });
}

export { addProduct, deleteProduct, state };
