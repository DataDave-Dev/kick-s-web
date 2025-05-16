import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const userCookie = cookies.get("sb-user");
        let user = null;
        if (userCookie) {
            try {
                user = JSON.parse(userCookie.value);
            } catch { }
        }

        const formData = await request.formData();

        const name = formData.get("firstName")?.toString();
        const lastname = formData.get("lastName")?.toString();
        const userNumber = formData.get("number")?.toString();
        const country = formData.get("country")?.toString();
        const address = formData.get("address")?.toString();
        const city = formData.get("city")?.toString();
        const postalCode = formData.get("postalCode")?.toString();
        const cartItemsRaw = formData.get("cartItems")?.toString() || "[]";

        if (!name || !lastname || !country || !address || !city || !postalCode || !userNumber) {
            return new Response(JSON.stringify({
                error: "Faltan campos requeridos para procesar la orden"
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        let cartItems: any[] = [];
        try {
            cartItems = JSON.parse(cartItemsRaw);
            if (!Array.isArray(cartItems)) throw new Error("Invalid cart format");
            if (cartItems.length === 0) {
                return new Response(JSON.stringify({
                    error: "El carrito está vacío"
                }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }
        } catch (error) {
            console.error("Error parsing cart items:", error);
            return new Response(JSON.stringify({
                error: "Error al analizar los artículos del carrito."
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const { data: mov, error: movError } = await supabase
            .from("Consecutivos")
            .select("Consecutivo")
            .eq("Tipo", 1)
            .single();

        console.log(mov)

        if (movError) {
            console.error("Error getting consecutive:", movError);
            return new Response(JSON.stringify({
                error: "Error al obtener el consecutivo de la base de datos."
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        if (!mov) {
            console.error("No consecutive found");
            return new Response(JSON.stringify({
                error: "No se encontró el registro de consecutivo en la base de datos."
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
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
                Estatus: 1,
                id_Usuario: user.id,
                Telefono: userNumber
            }]);

        if (orderError) {
            console.error("Error inserting order:", orderError);
            return new Response(JSON.stringify({
                error: "Error al insertar el pedido en la base de datos."
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        const hasInvalidItems = cartItems.some(item =>
            !item.Producto || !item.Cantidad || !item.Precio
        );

        if (hasInvalidItems) {
            console.error("Invalid cart items detected:", cartItems);
            return new Response(JSON.stringify({
                error: "Algunos productos en el carrito no tienen la información requerida."
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const orderDetails = cartItems.map(item => ({
            Referencia: orderReference,
            Producto: item.Producto,
            Cantidad: item.Cantidad,
            SubTotal: (item.Cantidad * item.Precio).toFixed(2),
            Impuestos: ((item.Cantidad * item.Precio) * .16).toFixed(2),
            Total: ((item.Cantidad * item.Precio) * 1.16).toFixed(2)
        }));

        const { error: orderDetailError } = await supabase
            .from("PedidosDetalles")
            .insert(orderDetails);

        if (orderDetailError) {
            console.error("Error inserting order details:", orderDetailError);
            return new Response(JSON.stringify({
                error: "Error al insertar los detalles del pedido en la base de datos."
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        const { error: updateConsecError } = await supabase
            .from("Consecutivos")
            .update({ Consecutivo: nextConsecutivo })
            .eq("Tipo", 1);

        if (updateConsecError) {
            console.error("Error updating consecutive:", updateConsecError);
            return new Response(JSON.stringify({
                error: "Error al actualizar el consecutivo en la base de datos."
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Success response
        return new Response(JSON.stringify({
            success: true,
            orderReference,
            redirect: "/orders" // Consider redirecting to a confirmation page
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        // Catch any unexpected errors
        console.error("Unexpected error in order processing:", error);
        return new Response(JSON.stringify({
            error: "Ha ocurrido un error inesperado al procesar la orden."
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
