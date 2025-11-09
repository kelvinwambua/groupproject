<?php
namespace App\Controllers;

use App\Models\Cart;
use App\Models\Cart_Item;
use App\Models\Product;

class CartItemController{
    public function addItemToCart($userId, $productId, $quantity, $price)
    {
        $cart = Cart::firstOrCreate(
            ['user_id' => $userId, 'status' => 'active'],
            ['quantity' => 0, 'total_price' => 0]
        );

        $cartItem = Cart_Item::where('cart_id', $cart->id)
                             ->where('product_id', $productId)
                             ->first();

        if ($cartItem) {
            $cartItem->quantity += $quantity;
            $cartItem->price = $price;
            $cartItem->save();
        } else {
            $product = Product::find($productId);
            if (!$product) {
                return ['success' => false, 'error' => 'Product not found'];
            }

            Cart_Item::create([
                'cart_id' => $cart->id,
                'product_id' => $productId,
                'quantity' => $quantity,
                'price' => $price,
                'image_url' => $product->image_url,
            ]);
        }

        $this->updateCartTotals($cart);

        return ['success' => true, 'message' => 'Item added to cart'];
    }

    private function updateCartTotals($cart)
    {
        $totalQuantity = 0;
        $totalPrice = 0;

        foreach ($cart->cart_items as $item) {
            $totalQuantity += $item->quantity;
            $totalPrice += $item->subtotal;
        }

        $cart->quantity = $totalQuantity;
        $cart->total_price = $totalPrice;
        $cart->save();
    }
    public function removeItemFromCart($userId, $productId)
    {
        $cart = Cart::where('user_id', $userId)
                    ->where('status', 'active')
                    ->first();

        if (!$cart) {
            return ['success' => false, 'error' => 'Cart not found'];
        }

        $cartItem = Cart_Item::where('cart_id', $cart->id)
                             ->where('product_id', $productId)
                             ->first();

        if (!$cartItem) {
            return ['success' => false, 'error' => 'Item not found in cart'];
        }

        $cartItem->delete();
        

        $this->updateCartTotals($cart);

        return ['success' => true, 'message' => 'Item removed from cart'];
    }
}