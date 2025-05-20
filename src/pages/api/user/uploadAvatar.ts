import { put } from '@vercel/blob';
import type { APIRoute } from "astro";
import { supabase } from '../../../lib/supabase';
import { randomUUID } from 'crypto';
import sharp from 'sharp';

export const POST: APIRoute = async ({ request, cookies }) => {
    const form = await request.formData();
    const file = form.get('file') as File | null;
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

    if (!file) {
        return new Response(
            JSON.stringify({ error: 'No se ha proporcionado ningún archivo' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    if (!user?.id) {
        return new Response(
            JSON.stringify({ error: 'ID de usuario requerido' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    if (!file.type.startsWith('image/')) {
        return new Response(
            JSON.stringify({ error: 'El archivo debe ser una imagen' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const webpBuffer = await sharp(buffer)
            .webp({ quality: 80 })
            .toBuffer();

        const filename = `${user.id}-${randomUUID()}.webp`;

        const blob = await put(`usersAvatars/${filename}`, webpBuffer, {
            access: 'public',
            token: import.meta.env.BLOB_READ_WRITE_TOKEN,
            allowOverwrite: true
        });

        const { data, error } = await supabase.auth.updateUser({
            data: {
                avatar_url: blob.url,
            }
        });

        user.avatar_url = blob.url;

        cookies.set("sb-user", JSON.stringify(user), {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            secure: true
        });

        return new Response(
            JSON.stringify({
                success: true,
                url: blob.url
            }),
            { headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error al procesar la imagen:', error);
        return new Response(
            JSON.stringify({ error: 'Error al subir el archivo' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
