import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const username = formData.get("username")?.toString();

  if (!email || !password || !username) {
    return redirect("/register?error=El+correo+electrónico+,+la+contraseña+y+el+nombre+de+usuario+son+requeridos");
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  const { data: user, error: userError } = await supabase.auth.updateUser({
    data: {
      username: username
    }
  });

  if (userError) {
    return redirect(`/register?error=${encodeURIComponent(userError.message)}`);
  }

  return redirect("/register?success=ok");
};