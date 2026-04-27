import React, { useState } from "react";

const avatars = [
  "/images/avatars/public/images/avatars/4447fc26-e8cd-4c05-bdd9-fced22c24991.jpg",
  "/images/avatars/public/images/avatars/e4834aae1967b716b771b027bfc41510-avatar-de-mascota-gato.webp",
  "/images/avatars/public/images/avatars/hipster-dog-avatar-vector.jpg",
];

interface ProfilePictureSelectorProps {
  currentProfileUrl: string;
  onUpdateProfilePicture: (newProfileUrl: string) => void;
}

const ProfilePictureSelector: React.FC<ProfilePictureSelectorProps> = ({
  currentProfileUrl,
  onUpdateProfilePicture,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleAvatarSelect = (avatarUrl: string) => {
    // Validación para evitar imágenes grandes, si es necesario
    const image = new Image();
    image.src = avatarUrl;

    image.onload = () => {
      const imgSize = image.width * image.height * 4; // Aproximación del tamaño en bytes
      if (imgSize > 500 * 1024) { // 500 KB
        setError("La imagen es demasiado grande. Elige una imagen más pequeña.");
        return;
      }

      // Actualizar la foto de perfil
      onUpdateProfilePicture(avatarUrl);
      setError(null); // Limpiar errores
    };
  };

  return (
    <div className="profile-picture-selector">
      <h2 className="text-xl font-bold mb-4">Selecciona un Avatar</h2>
      <div className="flex gap-4">
        {avatars.map((avatarUrl, index) => (
          <div
            key={index}
            className="cursor-pointer"
            onClick={() => handleAvatarSelect(avatarUrl)}
          >
            <img
              src={avatarUrl}
              alt={`Avatar ${index + 1}`}
              className="w-18 h-18 rounded-full object-cover"
            />
          </div>
        ))}
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default ProfilePictureSelector;