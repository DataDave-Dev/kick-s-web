import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const name = formData.get("name")?.toString();
  const lastname = formData.get("lastname")?.toString();

  if (!email || !password || !name || !lastname) {
    return redirect("/register?error=El+correo+electrónico,+la+contraseña+y+el+nombre+de+usuario+son+requeridos");
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError || !signUpData.user) {
    return redirect(`/register?error=${encodeURIComponent(signUpError?.message || "Error al registrar")}`);
  }

  const userId = signUpData.user.id;

  const { error: userUpdateError } = await supabase.auth.updateUser({
    data: {
      name,
      lastname,
    },
  });

  if (userUpdateError) {
    return redirect(`/register?error=${encodeURIComponent(userUpdateError.message)}`);
  }

  const { error: addressUserError } = await supabase
    .from("Direcciones")
    .insert([{ id_usuario: userId }]);

  if (addressUserError) {
    return redirect(`/register?error=${encodeURIComponent(addressUserError.message)}`);
  }

  return redirect("/register?success=ok");
};
