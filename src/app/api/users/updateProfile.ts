// /src/app/api/users/updateProfile.ts
import { prisma } from "../../../lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { userId, profileUrl } = req.body;

    if (!userId || !profileUrl) {
      return res.status(400).json({ success: false, message: "Faltan parámetros" });
    }

    try {
      // Actualiza la URL de la imagen de perfil
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { profileUrl },
      });

      res.status(200).json({ success: true, updatedUser });
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
  } else {
    res.status(405).json({ success: false, message: "Método no permitido" });
  }
}