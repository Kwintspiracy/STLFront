import Image from "next/image";

// ✅ Type pour une paire de métadonnées (label + valeur)
interface MetaItem {
  label: string;
  value: string;
}

// ✅ Type pour une section HTML avec un éventuel titre
interface HtmlSection {
  title?: string;
  html: string;
}

// ✅ Type des props attendues par le composant principal
interface DetailPageLayoutProps {
  title: string;                 // Nom du produit
  image: string;                 // URL de l'image complète (avec domaine)
  description?: string;         // Description simple
  meta?: MetaItem[];            // Infos additionnelles comme prix, studio
  htmlSections?: HtmlSection[]; // Sections HTML comme print settings ou dimensions
}

export default function DetailPageLayout({
  title,
  image,
  description,
  meta,
  htmlSections,
}: DetailPageLayoutProps) {
  return (
    <main className="max-w-5xl mx-auto px-4 py-12 text-white">
      {/* 🖼️ Image principale du produit */}
      <div className="w-full max-w-lg mx-auto mb-8">
        <Image
          src={image}
          alt={title}
          width={600}
          height={600}
          className="rounded"
        />
      </div>

      {/* 📝 Titre du produit */}
      <h1 className="text-4xl font-bold mb-4 text-center">{title}</h1>

      {/* 📄 Description s'il y en a une */}
      {description && (
        <p className="text-lg text-center text-gray-300 mb-6">
          {description}
        </p>
      )}

      {/* 🧾 Tableau des métadonnées */}
      {meta && meta.length > 0 && (
        <div className="mb-6">
          <ul className="space-y-1">
            {meta.map((item, idx) => (
              <li key={idx} className="text-sm">
                <strong>{item.label}:</strong> {item.value}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 🔧 Sections HTML (dimensions, print settings, etc.) */}
      {htmlSections && htmlSections.length > 0 && (
        <div className="space-y-4">
          {htmlSections.map((section, idx) => (
            <div key={idx}>
              {section.title && (
                <h2 className="text-xl font-semibold mb-2">
                  {section.title}
                </h2>
              )}
              <div
                className="text-sm text-gray-300"
                dangerouslySetInnerHTML={{ __html: section.html }}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
