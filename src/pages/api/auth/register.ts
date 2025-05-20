import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const name = formData.get("name")?.toString();
  const lastname = formData.get("lastname")?.toString();

  if (!email || !password || !name || !lastname) {
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
      name: name,
      lastname: lastname
    }
  });

  if (userError) {
    return redirect(`/register?error=${encodeURIComponent(userError.message)}`);
  }

  return redirect("/register?success=ok");
};