import Link from 'next/link';

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen bg-[#131618] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mt-24 p-6 bg-neutral-900 border border-neutral-700 rounded space-y-4 text-center">
          <div className="text-6xl mb-4">📧</div>
          
          <h1 className="text-xl font-bold text-white">Vérifiez votre email</h1>
          
          <p className="text-neutral-300 text-sm leading-relaxed">
            Nous avons envoyé un lien de vérification à votre adresse email. 
            Cliquez sur le lien dans {"l'email"} pour activer votre compte.
          </p>
          
          <div className="pt-4 space-y-2">
            <p className="text-neutral-400 text-xs">
              {"Vous n'avez pas reçu l'email ? Vérifiez votre dossier spam."}
            </p>
            
            <div className="flex flex-col space-y-2">
              <Link 
                href="/auth/signin" 
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Retour à la connexion
              </Link>
              
              <Link 
                href="/auth/register" 
                className="text-neutral-400 hover:text-neutral-300 text-sm"
              >
                Créer un autre compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
