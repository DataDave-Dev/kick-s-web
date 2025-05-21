import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";
import { isPasswordValid } from "../../../lib/utils"

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const newPassword = form.get("new-password")?.toString() || "";
  const confirmPassword = form.get("confirm-password")?.toString() || "";

  if (newPassword !== confirmPassword) {
    return new Response(JSON.stringify({ error: "Las contraseñas no coinciden" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!isPasswordValid(newPassword)) {
    return new Response(JSON.stringify({ 
      error: "La contraseña debe tener al menos 8 caracteres, una letra, un número y un símbolo." 
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const {
    data: { user },
    error: sessionError
  } = await supabase.auth.getUser();

  if (sessionError || !user) {
    return new Response(JSON.stringify({ error: "Usuario no autenticado." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    console.error("Error al cambiar la contraseña:", error);
    return new Response(JSON.stringify({ error: "No se pudo cambiar la contraseña." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return redirect("/settings");
};
