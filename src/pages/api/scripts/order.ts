import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request }) => {
    const formData = await request.formData();

    const name = formData.get("firstName")?.toString();
    const lastname = formData.get("lastName")?.toString();
    const country = formData.get("country")?.toString();
    const address = formData.get("address")?.toString();
    const city = formData.get("city")?.toString();
    const postalCode = formData.get("postalCode")?.toString();
    const cartItemsRaw = formData.get("cartItems")?.toString() || "[]";

    let cartItems: any[] = [];
    try {
        cartItems = JSON.parse(cartItemsRaw);
        if (!Array.isArray(cartItems)) throw new Error("Invalid cart format");
    } catch {
        return new Response("Error al analizar los artículos del carrito.", {
            status: 400,
        });
    }

    const { data: mov, error: movError } = await supabase
        .from("Consecutivos")
        .select("Consecutivo")
        .eq("Tipo", 1)
        .single();

    if (movError || !mov) {
        return new Response("Error al obtener el consecutivo.", { status: 500 });
    }

    const nameOrder = `${name} ${lastname}`;
    const nextConsecutivo = mov.Consecutivo + 1;
    const orderReference = nextConsecutivo.toString().padStart(6, "0");

    const { error: orderError } = await supabase
        .from("Pedidos")
        .insert([{
            Referencia: orderReference,
            Nombre: nameOrder,
            Direccion: address,
            Pais: country,
            Ciudad: city,
            CodigoPostal: postalCode,
            Estatus: 1
        }]);

    if (orderError) {
        return new Response("Error al insertar el pedido.", { status: 500 });
    }

    const orderDetails = cartItems.map(item => ({
        Referencia: orderReference,
        Producto: item.Producto,
        Cantidad: item.Cantidad,
        Subtotal: (item.Cantidad * item.Precio),
        Impuestos: (item.Cantidad * item.Precio) * .16,
        Total: (item.Cantidad * item.Precio) * 1.16
    }));

    const { error: orderDetailError } = await supabase
        .from("PedidosDetalles")
        .insert(orderDetails);

    if (orderDetailError) {
        return new Response("Error al insertar los detalles del pedido.", { status: 500 });
    }

    const { error: updateConsecError } = await supabase
        .from("Consecutivos")
        .update({ Consecutivo: nextConsecutivo })
        .eq("Tipo", 1);

    if (updateConsecError) {
        return new Response("Error al actualizar el consecutivo.", { status: 500 });
    }

    return new Response(JSON.stringify({
        success: true,
        orderReference
    }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
};
