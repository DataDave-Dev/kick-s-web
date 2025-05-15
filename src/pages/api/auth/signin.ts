import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
        return redirect("/signin?error=El+correo+electrónico+y+la+contraseña+son+requeridos");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        return redirect(`/signin?error=${encodeURIComponent(error.message)}`);
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {

        cookies.set("sb-user", JSON.stringify({
            id: user.id,
            email: user.email,
            username: user.user_metadata.username || null
        }), {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            secure: true
        });
    }

    const { access_token, refresh_token } = data.session;
    cookies.set("sb-access-token", access_token, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: true
    });
    cookies.set("sb-refresh-token", refresh_token, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: true
    });
    return redirect("/");
}