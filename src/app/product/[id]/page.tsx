export const dynamic = 'force-dynamic';
import { getProductById } from "@/lib/api/products";
import { notFound } from "next/navigation";
import CardCartButton from "@/components/card/CardCartButton";
import { RiShoppingCart2Fill } from "react-icons/ri";
import TagPill from "@/components/card/TagPill";
import ProductImageGallery from "@/components/product/ProductImageGallery";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage(props: ProductPageProps) {
  const { id } = await props.params;
  const product = await getProductById(Number(id));
  if (!product) notFound();

  return (
    <main className="max-w-[1440px] mx-auto text-white px-4">

      {/* Fil d'ariane */}
      <div className="w-full h-20 inline-flex justify-start items-center gap-6">
        {product.tag.map((tag) => (
          <TagPill key={tag.id} tag={tag.name} />
        ))}
      </div>

      {/* Contenu principal */}
      <div className="w-full flex flex-col md:flex-row gap-6">

        {/* Galerie d’images */}
        <div className="w-full md:max-w-[800px] lg:max-w-[700px]">
          <ProductImageGallery images={product.images} name={product.name} />
        </div>

        {/* Bloc d'infos produit */}
        <div className="w-full rounded-md sm:px-4 md:px-4 lg:px-6 pb-8">
          <div className="inline-flex flex-col justify-start items-start gap-5">
            <h1 className="text-zinc-100 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold">
              {product.name}
            </h1>

            <div className="inline-flex items-center gap-5">
              <img
                className="w-10 h-10 rounded-lg outline outline-neutral-500"
                src={product.creator.creatorlogo}
                alt={product.creator.name}
              />
              <p className="text-white text-base font-light">by {product.creator.name}</p>
            </div>
          </div>

          <div className="h-px bg-zinc-800 my-6" />

          <div className="flex flex-col justify-start items-start gap-6">
            <div>
              <div className="text-zinc-100 text-4xl font-bold">USD {product.price}</div>
              <div className="text-zinc-400 text-base font-normal">$4.10 goes to the creator</div>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-zinc-100 text-base">Select a type of license</p>
              <div className="inline-flex gap-2">
                <div className="p-3 bg-white rounded-md outline outline-offset-[-1px] outline-stone-300 flex items-center">
                  <span className="text-black text-base">Personal</span>
                </div>
                <div className="p-3 rounded-md outline outline-offset-[-1px] outline-stone-300 flex items-center">
                  <span className="text-stone-300 text-base">Commercial</span>
                </div>
              </div>
              <p className="text-zinc-400 text-base pb-6">
                The Personal License allows you to print and use the STL file for your own personal use.
                The file and any printed models may not be distributed, shared, or sold.
              </p>
            </div>
          </div>

          <CardCartButton href="/cart/">
            <RiShoppingCart2Fill className="w-6 h-6"/>
          </CardCartButton>

          <div className="h-px bg-zinc-800 my-6" />

          <div className="flex flex-col gap-3 mb-6">
            <h2 className="text-zinc-100 text-xl font-bold">Files</h2>
            <div className="text-[#F4F4F4] text-base font-normal">
              {Array.isArray(product.files) && product.files.length > 0 ? (
                product.files.map((file: string, i: number) => (
                  <div key={i}>{file}</div>
                ))
              ) : (
                <div>No downloadable files.</div>
              )}

            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <p className="text-[#F4F4F4] font-normal mb-2">
            {product.description || "No description available."}
          </p>
        </div>
      </div>
    </main>
  );
}
