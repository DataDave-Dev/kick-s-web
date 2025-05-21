import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();

  const address = form.get("address")?.toString() || "";
  const city = form.get("city")?.toString() || "";
  const postalCode = form.get("postal-code")?.toString() || "";
  const state = form.get("state")?.toString() || "";
  const country = form.get("country")?.toString() || "";
  const sameBilling = form.get("same-billing") === "on";

  const userCookie = cookies.get("sb-user");
  let userId = null;

  if (userCookie) {
    try {
      const user = JSON.parse(userCookie.value);
      userId = user.id;
    } catch (err) {
      console.error("Error al parsear el usuario:", err);
    }
  }

  if (!userId) {
    return new Response("No autorizado", { status: 401 });
  }

  const { data, error } = await supabase
    .from("Direcciones")
    .upsert(
      {
        id_usuario: userId,
        Direccion: address,
        Ciudad: city,
        Estado: state,
        CodigoPostal: postalCode,
        Pais: country,
        MismaParaFacturacion: sameBilling,
      },
      { onConflict: "id_usuario" }
    );

  if (error) {
    console.error("Error al guardar la dirección:", error);
    return new Response("Error al guardar la dirección", { status: 500 });
  }

  return redirect("/settings");
};
