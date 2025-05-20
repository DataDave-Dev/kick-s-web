import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const form = await request.formData();
    const name = form.get("first-name");
    const lastname = form.get("last-name");
    const email = form.get("email");
    const phone = form.get("phone");
    const userCookie = cookies.get("sb-user");
    let user = null;

    if (userCookie) {
        try {
            user = JSON.parse(userCookie.value);
        } catch (error) {
            console.error("Error al parsear la cookie del usuario:", error);
        }
    } else {
        return new Response(
            JSON.stringify({ error: 'No hay usuario autenticado' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    if (!user?.id) {
        return new Response(
            JSON.stringify({ error: 'ID de usuario requerido' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    if (!name || !lastname || !email) {
        return new Response(
            JSON.stringify({ error: 'Faltan campos obligatorios' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    try {
        const { data: updatedUser, error: userError } = await supabase.auth.updateUser({
            email: email.toString(),
            data: {
                name: name.toString(),
                lastname: lastname.toString(),
                phone: phone?.toString()
            }
        });

        user.name = name;
        user.lastname = lastname;
        user.email = email;
        user.phone = phone;

        cookies.set("sb-user", JSON.stringify(user), {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            secure: true
        });

        if (userError) {
            return redirect(`/settings?error=${encodeURIComponent(userError.message)}`);
        }
    } catch (err) {
        console.error("Error al actualizar los datos del usuario:", err);
        return redirect(`/settings?error=${encodeURIComponent('Error al actualizar los datos del usuario')}`);
    }

    return redirect("/settings?success=ok");
};
